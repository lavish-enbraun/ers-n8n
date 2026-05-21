import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	IconFile,
} from 'n8n-workflow';

export class ErsAppAccessTokenApi implements ICredentialType {
	name = 'ersAppAccessTokenApi';

	// eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-api
	displayName = 'eResource Scheduler Access Token';

	icon: { light: IconFile; dark: IconFile } = {
		light: 'file:../nodes/ErsApp/ersApp.svg',
		dark: 'file:../nodes/ErsApp/ersApp.dark.svg',
	};

	documentationUrl = 'https://github.com/org/-ers-app?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'http://dev.eresourcescheduler.cloud:8080',
			url: '/rest/user_profile',
			method: 'GET',
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};
}
