import {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

/**
 * Basic webhook trigger node for ERS App.
 * 
 * This is a simple webhook endpoint that accepts POST requests from ERS App.
 * It handles challenge verification and regular webhook events.
 * 
 * Use this node when:
 * - You need a simple webhook endpoint
 * - You'll manually configure webhooks in ERS App UI
 * - You don't need automatic webhook registration
 * 
 * For advanced features like automatic registration and entity filtering,
 * use ErsAppWebhookTrigger instead.
 * 
 * @implements {INodeType}
 * 
 * @example
 * // In n8n workflow:
 * // 1. Add "ERS App Trigger" node
 * // 2. Save and activate workflow
 * // 3. Copy webhook URL
 * // 4. Configure webhook in ERS App UI manually
 * // 5. Test by triggering event in ERS App
 * 
 * @see {@link https://github.com/lavish-enbraun/ers-n8n/blob/main/docs/WEBHOOKS.md}
 */
export class ErsAppTrigger implements INodeType {
	/**
	 * Node type description and configuration.
	 */
	description: INodeTypeDescription = {
		displayName: 'ERS App Trigger',
		name: 'ersAppTrigger',
		icon: 'file:ersApp.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow when ERS App sends a webhook',
		defaults: {
			name: 'ERS App Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'ersapp',
			},
		],
		properties: [],
	};

	/**
	 * Webhook handler for incoming requests from ERS App.
	 * 
	 * Handles two types of requests:
	 * 1. Challenge/verification requests (GET or POST with challenge field)
	 * 2. Regular webhook events (POST)
	 * 
	 * @param {IWebhookFunctions} this - n8n webhook context
	 * @returns {Promise<IWebhookResponseData>} Webhook response configuration
	 * 
	 * @example
	 * // GET verification request:
	 * // GET /webhook/ersapp?challenge=abc123
	 * // Response: { "challenge": "abc123" }
	 * 
	 * @example
	 * // POST challenge request:
	 * // POST /webhook/ersapp
	 * // Body: { "challenge": "abc123", "data": "test" }
	 * // Response: { "challenge": "abc123", "data": "test" }
	 * 
	 * @example
	 * // Regular webhook event:
	 * // POST /webhook/ersapp
	 * // Body: { "event": "create", "entity": "resource", "data": {...} }
	 * // Triggers workflow with this data
	 */
	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		if (req.method === 'GET') {
			// Handle GET challenge/verification requests
			// Some systems send ?challenge=<token> for webhook verification
			
			if (req.query.challenge) {
				res.status(200).json({ challenge: req.query.challenge });
			} else {
				res.status(200).send('OK');
			}
			
			return { noWebhookResponse: true };
		}

		// Handle POST requests
		if (req.method === 'POST') {
			const body = req.body || {};
			const challengeField = this.getNodeParameter('challengeField', '') as string || 'challenge';
			
			// Check if this is a challenge request by looking for the challenge field in the payload
			const isChallenge = body && typeof body === 'object' && challengeField in body;
			
			if (isChallenge) {
				// Challenge request: Echo the entire payload back
				// This is how ERS App verifies the webhook URL
				res.status(200).json(body);
				return { noWebhookResponse: true };
			}

			// Regular POST webhook event
			// Pass the body to the workflow for processing
			return {
				workflowData: [this.helpers.returnJsonArray(body)],
			};
		}

		// Fallback for other HTTP methods
		res.status(200).send('OK');
		return { noWebhookResponse: true };
	}
}

