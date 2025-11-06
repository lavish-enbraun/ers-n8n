import type { ICredentialType, INodeProperties, IconFile } from 'n8n-workflow';

export class ErsAppOAuth2Api implements ICredentialType {
	name = 'ersAppOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Ers App OAuth2 API';

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
			type: 'hidden',
			default: 'I7XLLz8dQ9P8wa0q',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			typeOptions: {
				password: true,
			},
			required: true,
			default: 'fixed-client-secret-abcde',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: `http://192.168.1.16:8080/login/oauth/authorize`,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: `http://192.168.1.16:8080/login/oauth/token`,
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
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
			default: 'http://localhost:5678/rest/oauth2-credential/callback',
			displayOptions: {
			  show: {
				// never true
				neverShow: ['true'],
			  },
			},
		  }
	];
}
