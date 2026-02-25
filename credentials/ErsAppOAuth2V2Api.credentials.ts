import type { 
	ICredentialType, 
	INodeProperties, 
	IconFile,
} from 'n8n-workflow';
import { BASE_URL, OAUTH_REDIRECT_URL } from '../nodes/ErsApp/constants';

export class ErsAppOAuth2V2Api implements ICredentialType {
	name = 'ersAppOAuth2V2Api';

	extends = ['oAuth2Api'];

	// eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-api, n8n-nodes-base/cred-class-field-display-name-missing-oauth2
	displayName = 'Sign in with eResource Scheduler (Configurable)';

	icon: { light: IconFile; dark: IconFile } = {
		light: 'file:../nodes/ErsApp/ersApp.svg',
		dark: 'file:../nodes/ErsApp/ersApp.dark.svg',
	};

	// Link to your community node's README
	documentationUrl = 'https://github.com/org/-ers-app?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'response_type=code',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: `${BASE_URL}/login/oauth/authorize`,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: `${BASE_URL}/login/oauth/token`,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'users:read users:write companies:read',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			displayName: 'OAuth Redirect URL',
			name: 'oauthRedirectUrl',
			type: 'hidden',
			default: OAUTH_REDIRECT_URL,
		},
	];
}

