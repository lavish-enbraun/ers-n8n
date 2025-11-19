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
			{
				displayName: 'Entities',
				name: 'entities',
				type: 'multiOptions',
				description: 'Select the entities to monitor for events',
				options: [
					{
						name: 'Resource',
						value: 1,
					},
					{
						name: 'Project',
						value: 2,
					},
					{
						name: 'Booking',
						value: 4,
					},
					{
						name: 'Timesheet',
						value: 8,
					},
					{
						name: 'Requirement',
						value: 16,
					},
					{
						name: 'Role Rate',
						value: 32,
					},
				],
				default: [],
				required: true,
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				description: 'Select the events to trigger on',
				options: [
					{
						name: 'Create',
						value: 1,
					},
					{
						name: 'Update',
						value: 2,
					},
					{
						name: 'Delete',
						value: 3,
					},
					{
						name: 'Add Task',
						value: 4,
					},
					{
						name: 'Edit Task',
						value: 5,
					},
					{
						name: 'Delete Task',
						value: 6,
					},
					{
						name: 'Add Rate',
						value: 7,
					},
					{
						name: 'Edit Rate',
						value: 8,
					},
					{
						name: 'Delete Rate',
						value: 9,
					},
				],
				default: [],
				required: true,
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
				const webhookRequestUrl = `${BASE_URL}/rest/webhooks`;
				console.log('[ERS Webhook] ========== WEBHOOK CREATION REQUEST ==========');
				console.log('[ERS Webhook] Request URL:', webhookRequestUrl);
				console.log('[ERS Webhook] Request Method: POST');
				console.log('[ERS Webhook] Request Payload:', JSON.stringify(payload, null, 2));
				console.log('[ERS Webhook] Request Headers:', {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken.substring(0, 20)}...` // Log partial token for security
				});
				
				const webhookResponse = await this.helpers.httpRequest({
						method: 'POST',
						url: webhookRequestUrl,
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: payload,
						json: true,
					}) as Record<string, unknown>;

					console.log('[ERS Webhook] ========== WEBHOOK CREATION RESPONSE ==========');
					console.log('[ERS Webhook] Response Status: Success');
					console.log('[ERS Webhook] Response Body:', JSON.stringify(webhookResponse, null, 2));
					console.log('[ERS Webhook] ============================================');
					
					// Step 2: GET request to /rest/webhooks to retrieve the webhook ID
					const getWebhooksUrl = `${BASE_URL}/rest/webhooks`;
					console.log('[ERS Webhook] ========== GET WEBHOOKS REQUEST ==========');
					console.log('[ERS Webhook] Request URL:', getWebhooksUrl);
					console.log('[ERS Webhook] Request Method: GET');
					console.log('[ERS Webhook] Request Headers:', {
						Authorization: `Bearer ${accessToken.substring(0, 20)}...` // Log partial token for security
					});
					
					const getWebhooksResponse = await this.helpers.httpRequest({
						method: 'GET',
						url: getWebhooksUrl,
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
						json: true,
					}) as Record<string, unknown>;

					console.log('[ERS Webhook] ========== GET WEBHOOKS RESPONSE ==========');
					console.log('[ERS Webhook] Response Status: Success');
					console.log('[ERS Webhook] Response Body:', JSON.stringify(getWebhooksResponse, null, 2));
					console.log('[ERS Webhook] ===========================================');
					
					// Extract webhook ID from GET response by matching the URL
					// Response structure: { data: [{ id: 5, url: "...", ... }] }
					const webhooksData = getWebhooksResponse.data as Array<Record<string, unknown>> | undefined;
					if (!webhooksData || !Array.isArray(webhooksData)) {
						console.error('[ERS Webhook] Unexpected GET webhooks response structure:', JSON.stringify(getWebhooksResponse, null, 2));
						throw new NodeApiError(this.getNode(), {
							message: 'Failed to get webhooks list. Unexpected response structure.',
						});
					}
					
					// Find the webhook we just created by matching the URL
					const createdWebhook = webhooksData.find(wh => {
						const whUrl = wh.url as string | undefined;
						return whUrl && whUrl === webhookUrl;
					});
					
					if (!createdWebhook || !createdWebhook.id) {
						console.error('[ERS Webhook] Could not find created webhook in list. Looking for URL:', webhookUrl);
						console.error('[ERS Webhook] Available webhooks:', webhooksData.map(wh => ({ id: wh.id, url: wh.url })));
						throw new NodeApiError(this.getNode(), {
							message: `Could not find the created webhook in the list. Searched for URL: ${webhookUrl}`,
						});
					}
					
					const webhookId = createdWebhook.id as number | string;
					console.log('[ERS Webhook] Found webhook ID:', webhookId, 'for URL:', webhookUrl);

					// Store webhook ID for later deletion
					const staticData = this.getWorkflowStaticData('node');
					staticData.webhookId = webhookId;

					// Get selected entities and events
					const entities = this.getNodeParameter('entities', []) as number[];
					const events = this.getNodeParameter('events', []) as number[];

					if (entities.length === 0 || events.length === 0) {
						console.warn('[ERS Webhook] No entities or events selected. Skipping trigger creation.');
						return true;
					}

					// Build triggers array - each entity gets all selected events
					const triggers = entities.map(entity => ({
						entity,
						events: events,
					}));

					const triggerPayload = {
						status: true,
						triggers: triggers,
					};

					// Step 3: POST request to /rest/webhooks/${id}/triggers to create triggers
					const triggerRequestUrl = `${BASE_URL}/rest/webhooks/${webhookId}/triggers`;
					console.log('[ERS Webhook] ========== TRIGGER CREATION REQUEST ==========');
					console.log('[ERS Webhook] Request URL:', triggerRequestUrl);
					console.log('[ERS Webhook] Request Method: POST');
					console.log('[ERS Webhook] Webhook ID:', webhookId);
					console.log('[ERS Webhook] Request Payload:', JSON.stringify(triggerPayload, null, 2));
					console.log('[ERS Webhook] Request Headers:', {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken.substring(0, 20)}...` // Log partial token for security
					});
					
					const triggerResponse = await this.helpers.httpRequest({
						method: 'POST',
						url: triggerRequestUrl,
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: triggerPayload,
						json: true,
					});

					console.log('[ERS Webhook] ========== TRIGGER CREATION RESPONSE ==========');
					console.log('[ERS Webhook] Response Status: Success');
					console.log('[ERS Webhook] Response Body:', JSON.stringify(triggerResponse, null, 2));
					console.log('[ERS Webhook] ==============================================');
					// ERS will immediately try to validate the webhook URL
					// The webhook handler will respond to the challenge
					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					console.error('[ERS Webhook] ========== ERROR OCCURRED ==========');
					console.error('[ERS Webhook] Error Message:', errorMessage);
					console.error('[ERS Webhook] Full Error:', error);
					if (error && typeof error === 'object' && 'response' in error) {
						const httpError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
						console.error('[ERS Webhook] HTTP Status:', httpError.response?.status);
						console.error('[ERS Webhook] HTTP Status Text:', httpError.response?.statusText);
						console.error('[ERS Webhook] Error Response Body:', JSON.stringify(httpError.response?.data, null, 2));
					}
					console.error('[ERS Webhook] ====================================');
					throw new NodeApiError(this.getNode(), {
						message: `Failed to register webhook or create triggers: ${errorMessage}`,
					});
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				try {
					const staticData = this.getWorkflowStaticData('node');
					const webhookId = staticData.webhookId as number | string | undefined;

					if (!webhookId) {
						console.warn('[ERS Webhook] No webhook ID found. Webhook may have already been deleted.');
						return true;
					}

					// Get OAuth2 credentials
					const credentials = await this.getCredentials('ersAppOAuth2Api');
					const creds = credentials as Record<string, unknown>;
					const accessToken = 
						(creds.access_token as string | undefined) || 
						(creds.accessToken as string | undefined) || 
						((creds.oauthTokenData as Record<string, unknown> | undefined)?.access_token as string | undefined) ||
						((creds.data as Record<string, unknown> | undefined)?.access_token as string | undefined);

					if (!accessToken) {
						console.warn('[ERS Webhook] No access token found. Skipping webhook deletion.');
						return true;
					}

					// Delete the webhook
					console.log('[ERS Webhook] Deleting webhook:', webhookId);
					await this.helpers.httpRequest({
						method: 'DELETE',
						url: `${BASE_URL}/rest/webhooks/${webhookId}`,
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					});

					console.log('[ERS Webhook] Webhook deleted successfully');
					
					// Clear stored webhook ID
					delete staticData.webhookId;
					
					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					console.error('[ERS Webhook] Failed to delete webhook:', errorMessage, error);
					// Don't throw error on delete failure - webhook may already be deleted
					return true;
				}
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
			const challengeField = 'challenge';
			
			Logger.info('[ERS Webhook] POST request received', { body });
			console.log('[ERS Webhook] POST request received', { body });
			
			// Check if this is a challenge request by looking for the challenge field in the payload
			const isChallenge = body && typeof body === 'object' && challengeField in body;
			
			if (isChallenge) {
				const challengeValue = (body as Record<string, unknown>)[challengeField];
				Logger.info('[ERS Webhook] Challenge token received (POST)', { 
					challenge: challengeValue,
					fullPayload: body 
				});
				console.log('[ERS Webhook] Challenge token received (POST)', { 
					challenge: challengeValue,
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

