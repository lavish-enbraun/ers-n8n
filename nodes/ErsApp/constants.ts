/**
 * Base URL for the ERS App API server.
 * This should point to your ERS App installation.
 * 
 * @constant {string}
 * @default 'http://192.168.1.201:8080'
 * 
 * @example
 * // To change for production:
 * export const BASE_URL = 'https://ers-app.yourcompany.com';
 * 
 * @see {@link https://github.com/lavish-enbraun/ers-n8n/blob/main/docs/API.md}
 */
export const BASE_URL = 'http://192.168.1.201:8080';

/**
 * Base path for REST API v1 endpoints.
 * All API endpoints are prefixed with this path.
 * 
 * @constant {string}
 * @default '/rest/v1'
 * 
 * @example
 * // Full API endpoint:
 * const endpoint = `${BASE_URL}${API_BASE_PATH}/resources`;
 * // Result: http://192.168.1.201:8080/rest/v1/resources
 */
export const API_BASE_PATH = '/rest/v1';


