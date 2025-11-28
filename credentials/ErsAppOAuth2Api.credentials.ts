import type { 
    ICredentialType, 
    INodeProperties, 
    IconFile,
} from 'n8n-workflow';
import { BASE_URL } from '../nodes/ErsApp/constants';

/**
 * OAuth2 credential type for ERS App API authentication.
 * 
 * This credential handles OAuth2 authentication using the Authorization Code grant type.
 * It manages access tokens, refresh tokens, and automatic token renewal.
 * 
 * @implements {ICredentialType}
 * 
 * @example
 * // In n8n UI:
 * // 1. Go to Credentials > New Credential
 * // 2. Search for "ERS App OAuth2 API"
 * // 3. Click "Connect my account"
 * // 4. Complete OAuth2 authorization flow
 * // 5. Save the credential
 * 
 * @see {@link https://github.com/lavish-enbraun/ers-n8n/blob/main/docs/CREDENTIALS.md}
 */
export class ErsAppOAuth2Api implements ICredentialType {
    /** Internal name used by n8n to identify this credential type */
    name = 'ersAppOAuth2Api';

    /** Extends n8n's base OAuth2 implementation */
    extends = ['oAuth2Api'];

    /** Display name shown in n8n UI */
    // eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-api, n8n-nodes-base/cred-class-field-display-name-missing-oauth2
    displayName = 'Sign in with eResource Scheduler';

    /** Icons displayed in n8n UI (light and dark mode) */
    icon: { light: IconFile; dark: IconFile } = {
        light: 'file:../nodes/ErsApp/ersApp.svg',
        dark: 'file:../nodes/ErsApp/ersApp.dark.svg',
    };

    /** Link to credential setup documentation */
    documentationUrl = 'https://github.com/org/-ers-app?tab=readme-ov-file#credentials';

    /**
     * OAuth2 configuration properties.
     * These are pre-configured for ERS App API and hidden from the user.
     * 
     * OAuth2 Flow:
     * 1. User clicks "Connect my account" in n8n
     * 2. Redirected to authUrl for authorization
     * 3. After approval, redirected back with authorization code
     * 4. n8n exchanges code for access token at accessTokenUrl
     * 5. Access token stored and used for API requests
     * 6. Refresh token used to obtain new access tokens when expired
     * 
     * Token Storage:
     * - Access tokens stored in credentials.access_token or credentials.oauthTokenData.access_token
     * - Automatically refreshed by n8n when expired
     * 
     * Scopes:
     * - users:read: Read user information and profiles
     * - users:write: Create and update users
     * - companies:read: Read company/organization data
     */
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