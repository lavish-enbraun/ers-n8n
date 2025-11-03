import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resourceDescription } from './resources/resource';

export class ErsApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ers App',
		name: 'ersApp',
		icon: { light: 'file:ersApp.svg', dark: 'file:ersApp.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Ers App API',
		defaults: {
			name: 'Ers App',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'ersAppOAuth2Api', required: true }],
		requestDefaults: {
			baseURL: `http://192.168.1.16:8080/login/oauth/authorize`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
			properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Resource',
						value: 'resource',
					},
				],
				default: 'resource',
			},
			...resourceDescription,
		],
	};
}
