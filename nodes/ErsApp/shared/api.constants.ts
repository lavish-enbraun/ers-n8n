const API_PROTOCOL = 'https';
const API_HOST = 'dev.eresourcescheduler.cloud';
const API_PORT = '8080';

export const ERS_APP_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;
export const ERS_APP_REST_BASE_URL = `${ERS_APP_BASE_URL}/rest`;
export const ERS_APP_V1_BASE_URL = `${ERS_APP_REST_BASE_URL}/v1`;

export const ERS_APP_OAUTH_AUTHORIZE_URL = `${ERS_APP_BASE_URL}/login/oauth/authorize`;
export const ERS_APP_OAUTH_TOKEN_URL = `${ERS_APP_BASE_URL}/login/oauth/token`;
