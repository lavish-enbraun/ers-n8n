import {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	IHookFunctions,
	NodeApiError,
	LoggerProxy as Logger,
	NodeConnectionTypes,
} from 'n8n-workflow';

/**
 * Maps ERS entity IDs to the event IDs they support.
 *
 * Entity IDs:
 * 1  = Resource
 * 2  = Project
 * 4  = Booking
 * 16 = Timesheet
 * 32 = Requirement
 *
 * Event IDs:
 * 1 = Create
 * 2 = Update
 * 3 = Delete
 */
const ENTITY_VALID_EVENTS: Record<number, number[]> = {
	1: [1, 2, 3], // Resource: create, update, delete
	2: [1, 2, 3], // Project: create, update, delete
	4: [1, 2, 3], // Booking: create, update, delete
	16: [1, 2, 3], // Timesheet: create, update, delete
	32: [1, 2, 3], // Requirement: create, update, delete
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
		return events;
	}

	const filtered = events.filter((event) => validEvents.includes(event));
	
	return filtered;
}

/**
 * Replaces webhook URL host with host.docker.internal:5678 for Docker compatibility
 * @param webhookUrl - The original webhook URL
 * @returns The webhook URL with host.docker.internal:5678 as the host
 */
function replaceWebhookUrlForDocker(webhookUrl: string): string {
	// Extract protocol and path from the original URL
	const urlMatch = webhookUrl.match(/^(https?:\/\/)([^/]+)(.*)$/);
	if (!urlMatch) {
		return webhookUrl;
	}
	
	const [, protocol, , path] = urlMatch;
	// Replace with host.docker.internal:5678
	return `${protocol}host.docker.internal:5678${path}`;
}

export class ErsAppTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ERS Trigger',
		name: 'ersAppTrigger',
		icon: { light: 'file:ersApp.svg', dark: 'file:ersApp.dark.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow when ERS sends a webhook event',
		defaults: {
			name: 'ERS Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'ersAppOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
			{
				name: 'ersAppAccessTokenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'ersapp',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'OAuth2 (recommended)',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
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
				],
				default: [],
				required: true,
			},
			{
				// Legacy configuration kept for backwards compatibility with
				// existing workflows that used the nested webhook settings.
				displayName: 'ERS Webhook (Legacy)',
				name: 'webhook',
				type: 'fixedCollection',
				default: {},
				description: 'Legacy ERS webhook trigger settings (hidden in new workflows)',
				options: [
					{
						name: 'webhookSettings',
						displayName: 'Webhook Settings',
						values: [
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
								],
								default: [],
								required: true,
							},
						],
					},
				],
				displayOptions: {
					show: {
						// This value is never set for authentication,
						// so the legacy field stays hidden in the UI.
						authentication: ['__never__'],
					},
				},
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Check if webhook already exists in static data
				const staticData = this.getWorkflowStaticData('node');
				const webhookId = staticData.webhookId as number | string | undefined;
				
				if (webhookId) {
					Logger.info('[ERS Webhook] Webhook already registered with ID', { webhookId });
					return true;
				}
				
				// No webhook ID in static data, need to create one
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Get webhook URL - this ensures the webhook is ready
				const generatedUrl = this.getNodeWebhookUrl('default');
				
				if (!generatedUrl) {
					throw new NodeApiError(this.getNode(), {
						message: 'ERS webhook setup failed: could not determine callback URL. Save the workflow and try activating it again.',
					});
				}
				
				// Replace webhook URL host with host.docker.internal:5678 for Docker compatibility
				const webhookUrl = replaceWebhookUrlForDocker(generatedUrl);
				
				const webhookPayload = {
					name: 'n8n',
					status: true,
					signed: false,
					url: webhookUrl,
				};

				try {
					const auth = this.getNodeParameter('authentication', 'oAuth2') as string;
					const credentialName =
						auth === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2Api';

					const staticData = this.getWorkflowStaticData('node');
					let webhookId: number | string | undefined = staticData.webhookId as number | string | undefined;
					let webhookExists = false;

					const webhooksListUrl = `http://dev.eresourcescheduler.cloud:8080/rest/webhooks`;
					Logger.info('[ERS Webhook] Checking for existing webhook at ERS API', { webhooksListUrl });

					const getWebhooksResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialName,
						{
							method: 'GET',
							url: webhooksListUrl,
							json: true,
						},
					) as Record<string, unknown>;
					
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
						Logger.info('[ERS Webhook] Found existing webhook with ID', { webhookId });
					}
				}

				if (!webhookExists) {
					const webhookRequestUrl = `http://dev.eresourcescheduler.cloud:8080/rest/webhooks`;
					Logger.info('[ERS Webhook] Creating ERS webhook', { webhookRequestUrl });

					await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
						method: 'POST',
						url: webhookRequestUrl,
						body: webhookPayload,
						json: true,
					});

					Logger.info('[ERS Webhook] ERS webhook created successfully.');

					const getWebhooksResponseAfterCreate = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialName,
						{
							method: 'GET',
							url: webhooksListUrl,
							json: true,
						},
					) as Record<string, unknown>;

					const webhooksDataAfterCreate = getWebhooksResponseAfterCreate.data as Array<Record<string, unknown>> | undefined;
					if (webhooksDataAfterCreate && Array.isArray(webhooksDataAfterCreate)) {
						const createdWebhook = webhooksDataAfterCreate.find(wh => {
							const whUrl = wh.url as string | undefined;
							return whUrl && whUrl === webhookUrl;
						});
						
						if (createdWebhook && createdWebhook.id) {
							webhookId = createdWebhook.id as number | string;
							staticData.webhookId = webhookId;
							Logger.info('[ERS Webhook] Created new webhook with ID', { webhookId });
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
					Logger.info('[ERS Webhook] Using existing webhook. Skipping webhook creation.');
				}

				if (!webhookId) {
					Logger.error('[ERS Webhook] No webhook ID available. Cannot proceed with trigger update.');
					throw new NodeApiError(this.getNode(), {
						message: 'ERS webhook setup failed: no webhook ID returned from ERS. Please try activating the node again.',
					});
				}

				Logger.info('[ERS Webhook] Proceeding to update triggers with webhook ID', { webhookId });
				
				// Step 3: Always update triggers whenever entities or events change
				// This ensures triggers are updated even when webhook already exists

				// Get selected entities and events from the new top-level
				// parameters so they are always visible in the UI.
				let entities = this.getNodeParameter('entities', []) as number[];
				let events = this.getNodeParameter('events', []) as number[];

				// Backwards compatibility: if no entities/events are set on the
				// new fields, fall back to the legacy nested webhook settings
				// for existing workflows.
				if (entities.length === 0 || events.length === 0) {
					const legacyWebhookParam = this.getNodeParameter('webhook', {}) as {
						webhookSettings?: { entities?: number[]; events?: number[] };
					};
					const legacyConfig = legacyWebhookParam.webhookSettings || {};

					if (Array.isArray(legacyConfig.entities) && legacyConfig.entities.length > 0) {
						entities = legacyConfig.entities;
					}
					if (Array.isArray(legacyConfig.events) && legacyConfig.events.length > 0) {
						events = legacyConfig.events;
					}
				}
				
				Logger.info('[ERS Webhook] Selected entities and events', { entities, events });

				if (entities.length === 0 || events.length === 0) {
					Logger.error('[ERS Webhook] No entities or events selected. Cannot configure webhook triggers.');
					throw new NodeApiError(this.getNode(), {
						message: 'ERS webhook configuration is invalid. Select at least one entity and one event in the node settings.',
					});
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
					Logger.error(
						'[ERS Webhook] No valid triggers after filtering. All selected events are invalid for the selected entities.',
					);
					throw new NodeApiError(this.getNode(), {
						message: 'ERS webhook configuration is invalid. The selected entities do not support the chosen events.',
					});
				}

				const triggerPayload = {
					status: true,
					triggers: triggers,
				};

				// Step 3: POST request to /rest/webhooks/${id}/triggers to create/update triggers
				// Using POST as it handles both creation and updates
				const triggerRequestUrl = `http://dev.eresourcescheduler.cloud:8080/rest/webhooks/${webhookId}/triggers`;
				Logger.info('[ERS Webhook] Updating ERS webhook triggers', { triggerRequestUrl, webhookId });

				await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
					method: 'POST',
					url: triggerRequestUrl,
					body: triggerPayload,
					json: true,
				});

				Logger.info('[ERS Webhook] ERS webhook triggers updated successfully.');
					// ERS will immediately try to validate the webhook URL
					// The webhook handler will respond to the challenge
					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					Logger.error('[ERS Webhook] Webhook setup error', { errorMessage, error });
					if (error && typeof error === 'object' && 'response' in error) {
						const httpError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
						Logger.error('[ERS Webhook] HTTP error details', {
							status: httpError.response?.status,
							statusText: httpError.response?.statusText,
							body: httpError.response?.data,
						});
					}
					throw new NodeApiError(this.getNode(), {
						message: `ERS webhook setup failed while creating the webhook or updating triggers. Details: ${errorMessage}`,
					});
				}
			},
			/**
			 * n8n calls this method both when:
			 * - The workflow using this trigger node is deactivated (unpublished)
			 * - The trigger node is removed from the workflow
			 *
			 * To avoid orphan webhooks in ERS, we always attempt to delete the
			 * remote webhook (and its triggers) whenever a webhookId is present.
			 */
			async delete(this: IHookFunctions): Promise<boolean> {
				Logger.info('[ERS Webhook] DELETE METHOD CALLED');
				try {
					const staticData = this.getWorkflowStaticData('node');
					const webhookId = staticData.webhookId as number | string | undefined;

					if (!webhookId) {
						Logger.info(
							'[ERS Webhook] No webhook ID found in static data. Webhook may have already been deleted or never created.',
						);
						return true;
					}

					const auth = this.getNodeParameter('authentication', 'oAuth2') as string;
					const credentialName =
						auth === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2Api';

					const deleteWebhookUrl = `http://dev.eresourcescheduler.cloud:8080/rest/webhooks/${webhookId}?force_delete_logs=true&force_delete_triggers=true`;
					Logger.info('[ERS Webhook] Deleting ERS webhook', { webhookId, deleteWebhookUrl });

					try {
						await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
							method: 'DELETE',
							url: deleteWebhookUrl,
							json: true,
						});
					} catch (error) {
						if (
							error &&
							typeof error === 'object' &&
							'response' in error &&
							(error as { response?: { status?: number } }).response?.status === 404
						) {
							Logger.info('[ERS Webhook] Webhook not found on server (404). It may have already been deleted.');
							delete staticData.webhookId;
							return true;
						}
						throw error;
					}

					Logger.info('[ERS Webhook] ERS webhook deleted successfully.');

					delete staticData.webhookId;

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					Logger.error('[ERS Webhook] WEBHOOK DELETION ERROR', { errorMessage, error });

					if (error && typeof error === 'object' && 'response' in error) {
						const httpError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
						Logger.error('[ERS Webhook] HTTP error details', {
							status: httpError.response?.status,
							statusText: httpError.response?.statusText,
							body: httpError.response?.data,
						});
					}

					const staticData = this.getWorkflowStaticData('node');
					delete staticData.webhookId;

					Logger.warn('[ERS Webhook] Failed to delete webhook from server, but continuing with node deletion.');
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
			if (req.query.challenge) {
				Logger.info('[ERS Webhook] Challenge token received (GET)', { challenge: req.query.challenge });
				res.status(200).json({ challenge: req.query.challenge });
			} else {
				Logger.info('[ERS Webhook] GET request without challenge token');
				res.status(200).send('OK');
			}
			
			return { noWebhookResponse: true };
		}

		// Handle POST requests
		if (req.method === 'POST') {
			const body = req.body || {};
			const challengeField = 'challenge';
			
			Logger.info('[ERS Webhook] POST request received', { body });

			// Check if this is a challenge request by looking for the challenge field in the payload
			const isChallenge = body && typeof body === 'object' && challengeField in body;

			if (isChallenge) {
				const challengeValue = (body as Record<string, unknown>)[challengeField];
				Logger.info('[ERS Webhook] Challenge token received (POST)', {
					challenge: challengeValue,
					fullPayload: body,
				});
				// Return the same payload as the HTTP response
				// This is how the target application verifies the webhook URL
				res.status(200).json(body);
				return { noWebhookResponse: true };
			}

			Logger.info('[ERS Webhook] POST request is not a challenge - treating as regular webhook event', {
				body,
			});
			// Regular POST webhook event from ERS
			const items = this.helpers.returnJsonArray(body);
			for (const item of items) {
				if (item.json && (item.json as Record<string, unknown>).source === undefined) {
					(item.json as Record<string, unknown>).source = 'ersApp';
				}
			}
			return {
				workflowData: [items],
			};
		}

		// Fallback
		res.status(200).send('OK');
		return { noWebhookResponse: true };
	}
}

