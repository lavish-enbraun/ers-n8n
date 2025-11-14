import {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	IHookFunctions,
	NodeApiError,
	LoggerProxy as Logger,
} from 'n8n-workflow';
import { BASE_URL } from './constants';

export class ErsAppWebhookTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ERS App Webhook Trigger',
		name: 'ersAppWebhookTrigger',
		icon: 'file:ersApp.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow when ERS App sends a webhook event',
		defaults: {
			name: 'ERS App Webhook Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'ersAppOAuth2Api', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'ersapp-webhook',
			},
		],
		properties: [
			{
				displayName: 'Webhook URL Override',
				name: 'webhookUrlOverride',
				type: 'string',
				default: '',
				description: 'Optionally override the webhook URL. Leave empty to use the auto-generated URL. Useful if you need to use a public URL (e.g., ngrok) instead of localhost.',
				placeholder: 'https://your-public-url.com/webhook/ersapp-webhook',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Get webhook URL override from node parameters
				const webhookUrlOverride = this.getNodeParameter('webhookUrlOverride', '') as string;
				
				// Use override URL if provided, otherwise use the auto-generated webhook URL
				let webhookUrl: string;
				if (webhookUrlOverride && webhookUrlOverride.trim() !== '') {
					webhookUrl = webhookUrlOverride.trim();
				} else {
					// Get webhook URL - this ensures the webhook is ready
					const generatedUrl = this.getNodeWebhookUrl('default');
					
					if (!generatedUrl) {
						throw new NodeApiError(this.getNode(), {
							message: 'Failed to get webhook URL. Please ensure the workflow is saved and activated.',
						});
					}
					
					webhookUrl = generatedUrl;
				}
				
				const payload = {
					name: 'n8n',
					status: true,
					signed: false,
					url: webhookUrl,
				};

				try {
					// Get OAuth2 credentials - n8n stores tokens in the credentials object
					const credentials = await this.getCredentials('ersAppOAuth2Api');
					
					// OAuth2 tokens can be stored in different locations
					// Check common locations for the access token
					const creds = credentials as Record<string, unknown>;
					const accessToken = 
						(creds.access_token as string | undefined) || 
						(creds.accessToken as string | undefined) || 
						((creds.oauthTokenData as Record<string, unknown> | undefined)?.access_token as string | undefined) ||
						((creds.data as Record<string, unknown> | undefined)?.access_token as string | undefined);

				if (!accessToken) {
					// Log available keys for debugging
					const keys = Object.keys(creds);
					console.error('[ERS Webhook] OAuth2 access token not found. Available credential keys:', keys);
					throw new NodeApiError(this.getNode(), {
						message: `OAuth2 access token not found. Please authenticate the credentials first. Available credential keys: ${keys.join(', ')}`,
					});
				}

				// Make POST request to register webhook with OAuth2 Bearer token
				console.log('[ERS Webhook] Registering webhook with URL:', webhookUrl);
				await this.helpers.httpRequest({
						method: 'POST',
						url: `${BASE_URL}/rest/webhooks`,
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: payload,
						json: true,
					});

					console.log('[ERS Webhook] Webhook registered successfully');
					// ERS will immediately try to validate the webhook URL
					// The webhook handler will respond to the challenge
					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					console.error('[ERS Webhook] Failed to register webhook:', errorMessage, error);
					throw new NodeApiError(this.getNode(), {
						message: `Failed to register webhook: ${errorMessage}`,
					});
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		if (req.method === 'GET') {
			// Handle GET challenge requests from ERS
			// Some systems send ?challenge=<token>
			Logger.info('[ERS Webhook] GET request received', { query: req.query });
			console.log('[ERS Webhook] GET request received', { query: req.query });
			if (req.query.challenge) {
				Logger.info('[ERS Webhook] Challenge token received (GET)', { challenge: req.query.challenge });
				console.log('[ERS Webhook] Challenge token received (GET)', { challenge: req.query.challenge });
				res.status(200).json({ challenge: req.query.challenge });
			} else {
				Logger.info('[ERS Webhook] GET request without challenge token');
				console.log('[ERS Webhook] GET request without challenge token');
				res.status(200).send('OK');
			}
			
			return { noWebhookResponse: true };
		}

		// Handle POST requests
		if (req.method === 'POST') {
			const body = req.body || {};
			const challengeField = this.getNodeParameter('challengeField', '') as string || 'challenge';
			
			Logger.info('[ERS Webhook] POST request received', { body, challengeField });
			console.log('[ERS Webhook] POST request received', { body, challengeField });
			
			// Check if this is a challenge request by looking for the challenge field in the payload
			const isChallenge = body && typeof body === 'object' && challengeField in body;
			
			if (isChallenge) {
				const challengeValue = (body as Record<string, unknown>)[challengeField];
				Logger.info('[ERS Webhook] Challenge token received (POST)', { 
					challenge: challengeValue,
					challengeField,
					fullPayload: body 
				});
				console.log('[ERS Webhook] Challenge token received (POST)', { 
					challenge: challengeValue,
					challengeField,
					fullPayload: body 
				});
				// Return the same payload as the HTTP response
				// This is how the target application verifies the webhook URL
				res.status(200).json(body);
				return { noWebhookResponse: true };
			}

			Logger.info('[ERS Webhook] POST request is not a challenge - treating as regular webhook event', { body });
			console.log('[ERS Webhook] POST request is not a challenge - treating as regular webhook event', { body });
			// Regular POST webhook event from ERS
			return {
				workflowData: [this.helpers.returnJsonArray(body)],
			};
		}

		// Fallback
		res.status(200).send('OK');
		return { noWebhookResponse: true };
	}
}

