# API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL and Configuration](#base-url-and-configuration)
- [Nodes](#nodes)
  - [ERS App Node](#ers-app-node)
  - [ERS App Trigger Node](#ers-app-trigger-node)
  - [ERS App Webhook Trigger Node](#ers-app-webhook-trigger-node)
- [Resources](#resources)
  - [Resource Operations](#resource-operations)
- [Data Types](#data-types)
- [Error Handling](#error-handling)

---

## Overview

The n8n ERS App integration provides a comprehensive set of nodes to interact with the eResource Scheduler (ERS) API. This integration supports:

- **Resource Management**: Create, read, and update resources
- **Webhook Triggers**: Receive real-time events from ERS App
- **OAuth2 Authentication**: Secure authentication using OAuth2 flow

---

## Authentication

### OAuth2 Credentials

The integration uses OAuth2 authentication with authorization code grant type.

**Credential Class**: `ErsAppOAuth2Api`

**Configuration Properties**:

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `clientId` | string | OAuth2 Client ID | `121` |
| `clientSecret` | string | OAuth2 Client Secret | `122` |
| `grantType` | string | OAuth2 Grant Type | `authorizationCode` |
| `authUrl` | string | Authorization URL | `{BASE_URL}/login/oauth/authorize` |
| `accessTokenUrl` | string | Access Token URL | `{BASE_URL}/login/oauth/token?client_source=system` |
| `scope` | string | OAuth2 Scopes | `users:read users:write companies:read` |

**Token Storage**:

Access tokens are stored in the credentials object and can be found in one of these locations:
- `credentials.access_token`
- `credentials.accessToken`
- `credentials.oauthTokenData.access_token`
- `credentials.data.access_token`

---

## Base URL and Configuration

The API base URL is configured in `constants.ts`:

```typescript
export const BASE_URL = 'http://192.168.1.201:8080';
export const API_BASE_PATH = '/rest/v1';
```

**Full API Endpoint Format**: `{BASE_URL}{API_BASE_PATH}/{resource}`

Example: `http://192.168.1.201:8080/rest/v1/resources`

---

## Nodes

### ERS App Node

Main node for performing operations on ERS App resources.

**Class**: `ErsApp`

**Node Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `displayName` | string | Display name in n8n UI: "Ers App" |
| `name` | string | Internal name: "ersApp" |
| `version` | number | Node version: `1` |
| `group` | array | Node category: `['transform']` |
| `usableAsTool` | boolean | Can be used as AI agent tool: `true` |

**Credentials Required**: `ersAppOAuth2Api`

**Input/Output**:
- **Inputs**: 1 main connection
- **Outputs**: 1 main connection

**Request Defaults**:
```typescript
{
  baseURL: `${BASE_URL}/login/oauth/authorize`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}
```

---

### ERS App Trigger Node

Basic webhook trigger for receiving POST requests from ERS App.

**Class**: `ErsAppTrigger`

**Node Properties**:

| Property | Type | Description |
|----------|------|-------------|
| `displayName` | string | "ERS App Trigger" |
| `name` | string | "ersAppTrigger" |
| `version` | number | `1` |
| `group` | array | `['trigger']` |

**Webhook Configuration**:
- **Path**: `/webhook/ersapp`
- **HTTP Method**: POST
- **Response Mode**: `onReceived` (immediate response)

**Webhook Handler**:

```typescript
async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>
```

**Behavior**:

1. **GET Requests**: Used for webhook verification
   - If `?challenge=<token>` query parameter exists, returns: `{ challenge: <token> }`
   - Otherwise returns: `OK`

2. **POST Requests**: 
   - **Challenge Request**: If body contains a `challenge` field, echoes the entire payload back
   - **Regular Webhook**: Returns the body as workflow data

**Example Usage**:

```typescript
// Verification request (GET)
GET /webhook/ersapp?challenge=abc123
Response: { "challenge": "abc123" }

// Challenge request (POST)
POST /webhook/ersapp
Body: { "challenge": "abc123", "data": "test" }
Response: { "challenge": "abc123", "data": "test" }

// Regular webhook (POST)
POST /webhook/ersapp
Body: { "event": "create", "resourceId": 123 }
// Triggers workflow with this data
```

---

### ERS App Webhook Trigger Node

Advanced webhook trigger with entity and event filtering, automatic webhook registration and management.

**Class**: `ErsAppWebhookTrigger`

**Node Properties**:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `webhookUrlOverride` | string | No | Override for webhook URL host (useful for ngrok/tunneling) |
| `entities` | multiOptions | Yes | Entity types to monitor |
| `events` | multiOptions | Yes | Event types to trigger on |

**Webhook Configuration**:
- **Path**: `/webhook/ersapp-webhook`
- **HTTP Method**: POST
- **Response Mode**: `onReceived`

#### Supported Entities and Events

**Entity IDs**:

| Entity | ID | Valid Events |
|--------|-----|--------------|
| Resource | 1 | 1, 2, 3, 7, 8, 9 |
| Project | 2 | 1, 2, 3, 4, 5, 6, 7, 8, 9 |
| Booking | 4 | 1, 2, 3 |
| Role Rate | 8 | 1, 2, 3 |
| Timesheet | 16 | 7, 8, 9 |
| Requirement | 32 | 1, 2, 3 |

**Event IDs**:

| Event | ID | Description |
|-------|-----|-------------|
| Create | 1 | Entity created |
| Update | 2 | Entity updated |
| Delete | 3 | Entity deleted |
| Add Task | 4 | Task added to entity |
| Edit Task | 5 | Task edited |
| Delete Task | 6 | Task deleted |
| Add Rate | 7 | Rate added |
| Edit Rate | 8 | Rate edited |
| Delete Rate | 9 | Rate deleted |

#### Webhook Methods

##### `checkExists()`

Checks if webhook already exists.

```typescript
async checkExists(this: IHookFunctions): Promise<boolean>
```

**Returns**: Always `false` to ensure triggers are updated on every activation

---

##### `create()`

Creates or updates webhook and its triggers.

```typescript
async create(this: IHookFunctions): Promise<boolean>
```

**Process Flow**:

1. **Get Webhook URL**: 
   - Retrieves n8n-generated webhook URL
   - Applies `webhookUrlOverride` if specified (replaces localhost/192.168.1.76)

2. **Check Existing Webhook**:
   - GET `/rest/webhooks` - fetches all webhooks
   - Matches webhook by URL
   - Stores webhook ID in workflow static data

3. **Create Webhook** (if doesn't exist):
   - POST `/rest/webhooks` with payload:
   ```json
   {
     "name": "n8n",
     "status": true,
     "signed": false,
     "url": "{webhook_url}"
   }
   ```

4. **Update Triggers** (always):
   - Filters events to only valid ones for selected entities
   - POST `/rest/webhooks/{id}/triggers` with payload:
   ```json
   {
     "status": true,
     "triggers": [
       {
         "entity": 1,
         "events": [1, 2, 3]
       }
     ]
   }
   ```

**Example**:

```typescript
// Node configuration
{
  webhookUrlOverride: "myapp.ngrok.io",
  entities: [1, 2],  // Resource, Project
  events: [1, 2]     // Create, Update
}

// Generated webhook URL
"http://localhost:5678/webhook/ersapp-webhook"

// Overridden URL (sent to ERS)
"http://myapp.ngrok.io:5678/webhook/ersapp-webhook"

// Triggers payload sent to ERS
{
  "status": true,
  "triggers": [
    { "entity": 1, "events": [1, 2] },  // Resource: Create, Update
    { "entity": 2, "events": [1, 2] }   // Project: Create, Update
  ]
}
```

---

##### `delete()`

Deletes webhook from ERS App when node is removed.

```typescript
async delete(this: IHookFunctions): Promise<boolean>
```

**Behavior**:

- **Workflow Deactivation**: Skips deletion (webhook persists)
- **Node Deletion**: Deletes webhook from ERS API

**Process**:

1. Checks if this is workflow deactivation or node deletion
2. If node deletion:
   - DELETE `/rest/webhooks/{id}?force_delete_logs=true&force_delete_triggers=true`
   - Clears webhook ID from static data
3. Handles 404 errors gracefully (webhook already deleted)

---

##### `webhook()`

Handles incoming webhook requests.

```typescript
async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>
```

**GET Requests**: Webhook verification
```typescript
// Request
GET /webhook/ersapp-webhook?challenge=abc123

// Response
{ "challenge": "abc123" }
```

**POST Requests**:

1. **Challenge Request**: Contains `challenge` field
   ```typescript
   // Request body
   { "challenge": "verify123" }
   
   // Response
   { "challenge": "verify123" }
   ```

2. **Regular Event**:
   ```typescript
   // Request body
   {
     "event": "create",
     "entity": "resource",
     "data": { "id": 123, "name": "John Doe" }
   }
   
   // Triggers workflow with this data
   ```

---

## Resources

### Resource Operations

Resource entity represents people, equipment, or other assets in ERS App.

**Base Endpoint**: `{BASE_URL}/rest/v1/resources`

---

#### Get Many Resources

Retrieves multiple resources with pagination support.

**Operation**: `getAll`

**HTTP Method**: GET

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `returnAll` | boolean | No | `false` | Whether to return all results or limit |
| `limit` | number | No | `50` | Maximum number of results (1-100) |
| `offset` | number | No | `0` | Pagination offset (auto-managed) |

**Pagination**:
- **Type**: Offset-based
- **Page Size**: 100 items per request
- **Query Parameters**: `limit`, `offset`

**Example Request**:

```http
GET /rest/v1/resources?limit=50&offset=0
Authorization: Bearer {access_token}
Accept: application/json
```

**Example Response**:

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "resource_type_id": 1,
      "start_date": "2024-01-01",
      "last_date": null
    }
  ],
  "meta": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### Create Resource

Creates a new resource in ERS App.

**Operation**: `create`

**HTTP Method**: POST

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `first_name` | string | Yes | First name of the resource |
| `start_date` | dateTime | Yes | Start date (YYYY-MM-DD) |
| `resource_type_id` | number | Yes | Resource type ID (min: 1) |
| `last_name` | string | No | Last name (for human resources, max 100 chars) |
| `last_date` | dateTime | No | Last working date (YYYY-MM-DD) |

**Additional Fields** (optional):

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Email address (max 254 chars) |
| `phone` | string | Phone number |
| `calendar` | number | Calendar ID to assign from start_date |

**Request Body Transformation**:

The node automatically transforms the parameters into the correct API format:

```javascript
{
  first_name: $parameter.first_name,
  start_date: new Date($parameter.start_date).toISOString().split("T")[0],
  resource_type_id: $parameter.resource_type_id,
  ...(last_name ? { last_name } : {}),
  ...(last_date ? { last_date: new Date(last_date).toISOString().split("T")[0] } : {}),
  ...(email ? { email } : {}),
  ...(phone ? { phone } : {}),
  ...(calendar ? { calendar } : {})
}
```

**Example Request**:

```http
POST /rest/v1/resources
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "resource_type_id": 1,
  "start_date": "2024-01-15",
  "calendar": 1
}
```

**Example Response**:

```json
{
  "data": {
    "id": 456,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "resource_type_id": 1,
    "start_date": "2024-01-15",
    "calendar_id": 1,
    "created_at": "2024-01-10T10:30:00Z"
  }
}
```

---

#### POST Many Resources

Sends multiple resources in a single request (bulk operation).

**Operation**: `postMany`

**HTTP Method**: POST

**Request Body**: Accepts raw JSON array from previous node output

**Example**:

```javascript
// Input from previous node ($json)
[
  {
    "first_name": "Alice",
    "resource_type_id": 1,
    "start_date": "2024-01-01"
  },
  {
    "first_name": "Bob",
    "resource_type_id": 2,
    "start_date": "2024-01-02"
  }
]
```

---

## Data Types

### Resource

```typescript
interface Resource {
  id: number;                    // Unique identifier
  first_name: string;            // Required, resource first name
  last_name?: string;            // Optional, for human resources (max 100 chars)
  email?: string;                // Optional, email address (max 254 chars)
  phone?: string;                // Optional, phone number
  resource_type_id: number;      // Required, type of resource
  start_date: string;            // Required, ISO date format (YYYY-MM-DD)
  last_date?: string;            // Optional, ISO date format (YYYY-MM-DD)
  calendar_id?: number;          // Optional, assigned calendar
  created_at?: string;           // ISO datetime
  updated_at?: string;           // ISO datetime
}
```

### Webhook Trigger

```typescript
interface WebhookTrigger {
  entity: number;                // Entity ID (1, 2, 4, 8, 16, 32)
  events: number[];              // Array of event IDs
}

interface WebhookPayload {
  name: string;                  // Webhook name
  status: boolean;               // Active status
  signed: boolean;               // Whether to sign requests
  url: string;                   // Webhook URL
}

interface TriggerPayload {
  status: boolean;               // Triggers active status
  triggers: WebhookTrigger[];    // Array of triggers
}
```

### Webhook Event

```typescript
interface WebhookEvent {
  event: string;                 // Event type (create, update, delete, etc.)
  entity: string;                // Entity type (resource, project, etc.)
  entity_id: number;             // Entity ID
  data: Record<string, unknown>; // Event data
  timestamp: string;             // ISO datetime
}
```

---

## Error Handling

### Node API Error

The integration uses n8n's `NodeApiError` for error handling:

```typescript
import { NodeApiError } from 'n8n-workflow';

throw new NodeApiError(this.getNode(), {
  message: 'Error description',
  description: 'Detailed error information',
  httpCode: 400
});
```

### Common Error Scenarios

#### 1. Authentication Errors

**Cause**: Invalid or expired OAuth2 token

**Error Message**: "OAuth2 access token not found. Please authenticate the credentials first."

**Solution**:
- Re-authenticate the credentials in n8n
- Check that credentials are properly saved
- Verify OAuth2 configuration

#### 2. Webhook Registration Errors

**Cause**: Webhook URL not accessible or invalid

**Error Message**: "Failed to register webhook or update triggers: {error}"

**Solution**:
- Ensure n8n is accessible from ERS App server
- Use `webhookUrlOverride` for local development (ngrok, etc.)
- Check firewall settings

#### 3. Invalid Entity/Event Combinations

**Cause**: Selected events not valid for chosen entities

**Behavior**: 
- Invalid events are filtered out automatically
- Warning logged: "Entity {id}: Filtered out invalid events: {events}"

**Solution**: Check the valid events table for each entity type

#### 4. Missing Webhook ID

**Cause**: Webhook creation succeeded but ID not found

**Error Message**: "Webhook created but could not find it in the list"

**Solution**:
- Check ERS App API logs
- Verify GET /rest/webhooks returns created webhook
- Manually check webhook list in ERS App UI

---

## Helper Functions

### `getValidEventsForEntity(entity: number, events: number[]): number[]`

Filters event IDs to only include those valid for a specific entity.

**Parameters**:
- `entity`: Entity ID (1, 2, 4, 8, 16, or 32)
- `events`: Array of event IDs to filter

**Returns**: Array of valid event IDs

**Example**:

```typescript
// Resource (entity: 1) only supports events: 1, 2, 3, 7, 8, 9
const validEvents = getValidEventsForEntity(1, [1, 2, 4, 5, 7]);
// Returns: [1, 2, 7]
// Filters out: [4, 5] (not valid for Resource)
```

---

### `overrideWebhookUrl(webhookUrl: string, overrideValue: string): string`

Replaces localhost or specific IPs in webhook URL with a custom host.

**Parameters**:
- `webhookUrl`: Original webhook URL
- `overrideValue`: Host to replace with (e.g., "myapp.ngrok.io")

**Returns**: Modified webhook URL

**Example**:

```typescript
const url = "http://localhost:5678/webhook/ersapp";
const overridden = overrideWebhookUrl(url, "myapp.ngrok.io");
// Returns: "http://myapp.ngrok.io:5678/webhook/ersapp"
```

**Features**:
- Preserves protocol (http/https)
- Preserves port numbers
- Handles both localhost and IP addresses
- Returns original URL if overrideValue is empty

---

## API Rate Limits

> **Note**: Rate limit information should be obtained from your ERS App API documentation. This integration does not implement rate limiting at the node level.

**Best Practices**:
- Use pagination for large datasets
- Implement error handling for 429 (Too Many Requests) responses
- Add delays between bulk operations using n8n's Wait node

---

## Logging and Debugging

The webhook trigger node includes extensive logging for debugging:

**Console Logs**:

```typescript
// Webhook creation
console.log('[ERS Webhook] ========== WEBHOOK CREATION REQUEST ==========');
console.log('[ERS Webhook] Request URL:', url);
console.log('[ERS Webhook] Request Payload:', payload);

// Trigger updates
console.log('[ERS Webhook] ========== TRIGGER UPDATE REQUEST ==========');
console.log('[ERS Webhook] Webhook ID:', webhookId);

// Webhook events
console.log('[ERS Webhook] POST request received', { body });
```

**Enable Logging**:

All logs are prefixed with `[ERS Webhook]` for easy filtering. To view logs:

```bash
# In n8n logs
docker logs n8n | grep "ERS Webhook"

# Or in terminal where n8n is running
```

---

## Security Considerations

### 1. OAuth2 Tokens

- Tokens are stored encrypted in n8n credentials
- Never log full access tokens (only first 20 chars for debugging)
- Tokens automatically refresh when expired

### 2. Webhook Security

Currently, the integration uses unsigned webhooks:

```typescript
{
  "signed": false  // Webhooks are not cryptographically signed
}
```

**Recommendations**:
- Use HTTPS in production
- Implement IP whitelisting in n8n
- Consider enabling signed webhooks in future versions

### 3. Credential Scopes

Current OAuth2 scopes:
- `users:read` - Read user information
- `users:write` - Create/update users
- `companies:read` - Read company information

**Note**: Adjust scopes based on required operations

---

## Version History

### Version 1.0.0

**Features**:
- Initial release
- Resource operations (Get Many, Create, POST Many)
- Basic webhook trigger (ErsAppTrigger)
- Advanced webhook trigger with entity/event filtering (ErsAppWebhookTrigger)
- OAuth2 authentication
- Automatic webhook registration and management
- Webhook URL override for local development

**Known Limitations**:
- Only Resource entity operations implemented
- No support for Update, Delete operations
- Unsigned webhooks only

---

## API Reference Links

- **ERS App API Documentation**: Contact your ERS App administrator
- **n8n Node Development**: https://docs.n8n.io/integrations/creating-nodes/
- **n8n OAuth2**: https://docs.n8n.io/integrations/creating-nodes/build/reference/credentials/#oauth2

---

## Support

For issues and feature requests:
- **GitHub**: https://github.com/lavish-enbraun/ers-n8n
- **Email**: lavish.pareta@enbraun.com

---

**Last Updated**: November 28, 2025  
**API Version**: 1.0  
**Node Version**: 0.1.0
