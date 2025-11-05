import {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class ErsAppTrigger implements INodeType {
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

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		if (req.method === 'GET') {
			console.log('🔍 Verification request received:', req.query);
			
			// Some systems send ?challenge=<token>
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
			
			// Log request details for debugging
			console.log('POST Request received');
			console.log('Body:', JSON.stringify(body, null, 2));
			
			// Check if this is a challenge request by looking for the challenge field in the payload
			const isChallenge = body && typeof body === 'object' && challengeField in body;
			
			if (isChallenge) {
				console.log('Challenge detected! Field:', challengeField, 'Value:', body[challengeField]);
				console.log('Echoing challenge payload back as response');
				
				// Return the same payload as the HTTP response
				// This is how the target application verifies the webhook URL
				res.status(200).json(body);
				return { noWebhookResponse: true };
			}

			// Regular POST webhook
			console.log('📩 Webhook received (not a challenge):', body);

			return {
				workflowData: [this.helpers.returnJsonArray(body)],
			};
		}

		// Fallback
		res.status(200).send('OK');
		return { noWebhookResponse: true };
	}
}

