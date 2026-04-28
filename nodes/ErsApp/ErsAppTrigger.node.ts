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
import { BASE_URL } from './constants';

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
				name: 'ersAppAccessTokenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: 'ersAppOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
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
						auth === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2Api';

					const staticData = this.getWorkflowStaticData('node');
					let webhookId: number | string | undefined = staticData.webhookId as number | string | undefined;
					let webhookExists = false;

					const webhooksListUrl = `${BASE_URL}/rest/webhooks`;

					const getWebhooksResponse = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialName,
						{
							method: 'GET',
							url: webhooksListUrl,
							json: true,
						},
					)) as Record<string, unknown>;

					const webhooksData = getWebhooksResponse.data as Array<Record<string, unknown>> | undefined;
					if (webhooksData && Array.isArray(webhooksData)) {
						const existingWebhook = webhooksData.find((wh) => {
							const whUrl = wh.url as string | undefined;
							return whUrl && whUrl === webhookUrl;
						});

						if (existingWebhook && existingWebhook.id) {
							webhookId = existingWebhook.id as number | string;
							webhookExists = true;
							staticData.webhookId = webhookId;
						}
					}

					if (!webhookExists) {
						const webhookRequestUrl = `${BASE_URL}/rest/webhooks`;

						await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
							method: 'POST',
							url: webhookRequestUrl,
							headers: {
								'Content-Type': 'application/json',
							},
							body: webhookPayload,
							json: true,
						});

						const getWebhooksResponseAfterCreate = (await this.helpers.httpRequestWithAuthentication.call(
							this,
							credentialName,
							{
								method: 'GET',
								url: webhooksListUrl,
								json: true,
							},
						)) as Record<string, unknown>;

						const webhooksDataAfterCreate = getWebhooksResponseAfterCreate.data as
							| Array<Record<string, unknown>>
							| undefined;
						if (webhooksDataAfterCreate && Array.isArray(webhooksDataAfterCreate)) {
							const createdWebhook = webhooksDataAfterCreate.find((wh) => {
								const whUrl = wh.url as string | undefined;
								return whUrl && whUrl === webhookUrl;
							});

							if (createdWebhook && createdWebhook.id) {
								webhookId = createdWebhook.id as number | string;
								staticData.webhookId = webhookId;
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
					}

					if (!webhookId) {
						throw new NodeApiError(this.getNode(), {
							message:
								'ERS webhook setup failed: no webhook ID returned from ERS. Please try activating the node again.',
						});
					}

					let entities = this.getNodeParameter('entities', []) as number[];
					let events = this.getNodeParameter('events', []) as number[];

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

					if (entities.length === 0 || events.length === 0) {
						throw new NodeApiError(this.getNode(), {
							message:
								'ERS webhook configuration is invalid. Select at least one entity and one event in the node settings.',
						});
					}

					const triggers = entities
						.map((entity) => {
							const validEvents = getValidEventsForEntity(entity, events);
							return {
								entity,
								events: validEvents,
							};
						})
						.filter((trigger) => trigger.events.length > 0);

					if (triggers.length === 0) {
						throw new NodeApiError(this.getNode(), {
							message:
								'ERS webhook configuration is invalid. The selected entities do not support the chosen events.',
						});
					}

					const triggerPayload = {
						status: true,
						triggers: triggers,
					};

					const triggerRequestUrl = `${BASE_URL}/rest/webhooks/${webhookId}/triggers`;

					await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
						method: 'POST',
						url: triggerRequestUrl,
						headers: {
							'Content-Type': 'application/json',
						},
						body: triggerPayload,
						json: true,
					});

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
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
				try {
					const staticData = this.getWorkflowStaticData('node');
					const webhookId = staticData.webhookId as number | string | undefined;

					if (!webhookId) {
						return true;
					}

					const auth = this.getNodeParameter('authentication', 'oAuth2') as string;
					const credentialName =
						auth === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2Api';

					const deleteWebhookUrl = `${BASE_URL}/rest/webhooks/${webhookId}?force_delete_logs=true&force_delete_triggers=true`;

					try {
						await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
							method: 'DELETE',
							url: deleteWebhookUrl,
							json: true,
						});
					} catch (error) {
						if (error && typeof error === 'object' && 'response' in error) {
							const httpError = error as { response?: { status?: number } };
							if (httpError.response?.status === 404) {
								delete staticData.webhookId;
								return true;
							}
						}
					}

					delete staticData.webhookId;
					return true;
				} catch {
					const staticData = this.getWorkflowStaticData('node');
					delete staticData.webhookId;
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

			Logger.info('[ERS Webhook] POST request is not a challenge - treating as regular webhook event', { body });
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

