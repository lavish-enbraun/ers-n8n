import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resourceDescription } from './resources/resource';
import { BASE_URL } from './constants';

/**
 * Main ERS App node for performing operations on ERS App resources.
 * 
 * This node provides access to various ERS App resources and operations:
 * - Resource management (create, read, update)
 * - OAuth2 authentication
 * - Automatic request handling
 * 
 * @implements {INodeType}
 * 
 * @example
 * // In n8n workflow:
 * // 1. Add "Ers App" node
 * // 2. Select credentials
 * // 3. Choose resource (e.g., Resource)
 * // 4. Choose operation (e.g., Get Many, Create)
 * // 5. Configure parameters
 * // 6. Execute
 * 
 * @see {@link https://github.com/lavish-enbraun/ers-n8n/blob/main/docs/API.md}
 * @see {@link https://github.com/lavish-enbraun/ers-n8n/blob/main/docs/USAGE.md}
 */
export class ErsApp implements INodeType {
	/**
	 * Node type description and configuration.
	 * Defines the node's appearance, behavior, and parameters in n8n UI.
	 */
	description: INodeTypeDescription = {
		/** Display name shown in n8n node selector and canvas */
		displayName: 'Ers App',
		/** Internal node name (must be unique) */
		name: 'ersApp',
		/** Icons for light and dark mode */
		icon: { light: 'file:ersApp.svg', dark: 'file:ersApp.dark.svg' },
		/** Node category in n8n UI */
		group: ['transform'],
		/** Node version for tracking changes */
		version: 1,
		/** Subtitle expression shown below node on canvas */
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		/** Description shown in node selector */
		description: 'Interact with the Ers App API',
		/** Default node configuration when added to workflow */
		defaults: {
			name: 'Ers App',
		},
		/** Can be used as a tool by AI agents */
		usableAsTool: true,
		/** Node accepts one main input connection */
		inputs: [NodeConnectionTypes.Main],
		/** Node provides one main output connection */
		outputs: [NodeConnectionTypes.Main],
		/** Required OAuth2 credentials */
		credentials: [{ name: 'ersAppOAuth2Api', required: true }],
		/** Default request configuration for all API calls */
		requestDefaults: {
			baseURL: `${BASE_URL}/login/oauth/authorize`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		/** Node parameters displayed in UI */
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
