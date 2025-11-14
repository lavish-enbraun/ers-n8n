import type { 
    ICredentialType, 
    INodeProperties, 
    IconFile,
} from 'n8n-workflow';
import { BASE_URL } from '../nodes/ErsApp/constants';

export class ErsAppOAuth2Api implements ICredentialType {
    name = 'ersAppOAuth2Api';

    extends = ['oAuth2Api'];

    // eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-api, n8n-nodes-base/cred-class-field-display-name-missing-oauth2
    displayName = 'Sign in with eResource Scheduler';

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
            default: '121',
        },
        {
            displayName: 'Client Secret',
            name: 'clientSecret',
            type: 'hidden',
            typeOptions: {
                password: true,
            },
            required: true,
            default: '122',
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
            default: `${BASE_URL}/login/oauth/authorize`,
        },
        {
            displayName: 'Access Token URL',
            name: 'accessTokenUrl',
            type: 'hidden',
            default: `${BASE_URL}/login/oauth/token?client_source=system`,
        },
        {
            displayName: 'Auth URI Query Parameters',
            name: 'authQueryParameters',
            type: 'hidden',
            default: 'client_source=system',
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
        },
    ];
}