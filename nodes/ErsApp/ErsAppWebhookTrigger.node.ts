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

/**
 * Maps entity IDs to their valid event IDs
 */
const ENTITY_VALID_EVENTS: Record<number, number[]> = {
	1: [1, 2, 3, 7, 8, 9],   // Resource
	2: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Project
	4: [1, 2, 3],             // Booking
	8: [1, 2, 3],              // Role Rate
	16: [7, 8, 9],            // Timesheet
	32: [1, 2, 3],            // Requirement
};

/**
 * Filters events to only include those valid for the given entity
 * @param entity - The entity ID
 * @param events - Array of event IDs to filter
 * @returns Array of valid event IDs for the entity
 */
function getValidEventsForEntity(entity: number, events: number[]): number[] {
	const validEvents = ENTITY_VALID_EVENTS[entity];
	if (!validEvents) {
		console.warn(`[ERS Webhook] Unknown entity ID: ${entity}. Allowing all events.`);
		return events;
	}
	
	const filtered = events.filter(event => validEvents.includes(event));
	if (filtered.length !== events.length) {
		const removed = events.filter(event => !validEvents.includes(event));
		console.log(`[ERS Webhook] Entity ${entity}: Filtered out invalid events: ${removed.join(', ')}`);
	}
	
	return filtered;
}

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
						name: 'Role Rate',
						value: 8,
					},
					{
						name: 'Timesheet',
						value: 16,
					},
					{
						name: 'Requirement',
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
				// Always return false to ensure create() method is always called
				// This allows triggers to be updated whenever entities/events change
				// The create() method already handles checking for existing webhooks
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

				// Check if webhook already exists
				const staticData = this.getWorkflowStaticData('node');
				let webhookId: number | string | undefined = staticData.webhookId as number | string | undefined;
				let webhookExists = false;

				// Step 1: Check if webhook exists by getting all webhooks
				const getWebhooksUrl = `${BASE_URL}/rest/webhooks`;
				console.log('[ERS Webhook] ========== CHECKING FOR EXISTING WEBHOOK ==========');
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
				const webhooksData = getWebhooksResponse.data as Array<Record<string, unknown>> | undefined;
				if (webhooksData && Array.isArray(webhooksData)) {
					// Find the webhook we're looking for by matching the URL
					const existingWebhook = webhooksData.find(wh => {
						const whUrl = wh.url as string | undefined;
						return whUrl && whUrl === webhookUrl;
					});
					
					if (existingWebhook && existingWebhook.id) {
						webhookId = existingWebhook.id as number | string;
						webhookExists = true;
						staticData.webhookId = webhookId;
						console.log('[ERS Webhook] Found existing webhook with ID:', webhookId);
					}
				}

				// Step 2: Create webhook only if it doesn't exist
				if (!webhookExists) {
					console.log('[ERS Webhook] Webhook does not exist. Creating new webhook...');
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
					
					// Get the webhook ID from the GET response again (after creation)
					// Re-fetch to get the newly created webhook
					const getWebhooksResponseAfterCreate = await this.helpers.httpRequest({
						method: 'GET',
						url: getWebhooksUrl,
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
						json: true,
					}) as Record<string, unknown>;

					const webhooksDataAfterCreate = getWebhooksResponseAfterCreate.data as Array<Record<string, unknown>> | undefined;
					if (webhooksDataAfterCreate && Array.isArray(webhooksDataAfterCreate)) {
						const createdWebhook = webhooksDataAfterCreate.find(wh => {
							const whUrl = wh.url as string | undefined;
							return whUrl && whUrl === webhookUrl;
						});
						
						if (createdWebhook && createdWebhook.id) {
							webhookId = createdWebhook.id as number | string;
							staticData.webhookId = webhookId;
							console.log('[ERS Webhook] Created new webhook with ID:', webhookId);
						} else {
							throw new NodeApiError(this.getNode(), {
								message: `Webhook created but could not find it in the list. Searched for URL: ${webhookUrl}`,
							});
						}
					} else {
						throw new NodeApiError(this.getNode(), {
							message: 'Webhook created but failed to retrieve webhook list to get ID.',
						});
					}
				} else {
					console.log('[ERS Webhook] Using existing webhook. Skipping webhook creation.');
				}

				// Ensure we have a webhook ID at this point
				if (!webhookId) {
					console.error('[ERS Webhook] No webhook ID available. Cannot proceed with trigger update.');
					throw new NodeApiError(this.getNode(), {
						message: 'Failed to get webhook ID. Cannot proceed with trigger update.',
					});
				}
					
				console.log('[ERS Webhook] Proceeding to update triggers with webhook ID:', webhookId);
				
				// Step 3: Always update triggers whenever entities or events change
				// This ensures triggers are updated even when webhook already exists

				// Get selected entities and events
				const entities = this.getNodeParameter('entities', []) as number[];
				const events = this.getNodeParameter('events', []) as number[];
				
				console.log('[ERS Webhook] Selected entities:', entities);
				console.log('[ERS Webhook] Selected events:', events);

				if (entities.length === 0 || events.length === 0) {
					console.warn('[ERS Webhook] No entities or events selected. Skipping trigger update.');
					return true;
				}

				// Build triggers array - each entity gets only valid events for that entity
				const triggers = entities.map(entity => {
					const validEvents = getValidEventsForEntity(entity, events);
					return {
						entity,
						events: validEvents,
					};
				}).filter(trigger => trigger.events.length > 0); // Remove triggers with no valid events

				if (triggers.length === 0) {
					console.warn('[ERS Webhook] No valid triggers after filtering. All selected events are invalid for the selected entities.');
					return true;
				}

				const triggerPayload = {
					status: true,
					triggers: triggers,
				};

				// Step 3: POST request to /rest/webhooks/${id}/triggers to create/update triggers
				// Using POST as it handles both creation and updates
				const triggerRequestUrl = `${BASE_URL}/rest/webhooks/${webhookId}/triggers`;
				console.log('[ERS Webhook] ========== TRIGGER UPDATE REQUEST ==========');
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

				console.log('[ERS Webhook] ========== TRIGGER UPDATE RESPONSE ==========');
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
						message: `Failed to register webhook or update triggers: ${errorMessage}`,
					});
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Webhook deletion is disabled to avoid 409 conflicts
				// The webhook will remain on the server even when the node is deactivated
				console.log('[ERS Webhook] Webhook deletion is disabled. Webhook will remain on the server.');
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

