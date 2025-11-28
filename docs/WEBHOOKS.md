# Webhooks Guide

## Table of Contents

- [Overview](#overview)
- [Webhook Nodes](#webhook-nodes)
- [Setup Guide](#setup-guide)
- [Entity and Event Configuration](#entity-and-event-configuration)
- [Webhook Lifecycle](#webhook-lifecycle)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Webhook Payload Structure](#webhook-payload-structure)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

---

## Overview

The ERS App integration provides two webhook trigger nodes for receiving real-time events from ERS App:

1. **ERS App Trigger** - Basic webhook trigger for simple use cases
2. **ERS App Webhook Trigger** - Advanced trigger with automatic registration and entity/event filtering

### When to Use Which Node?

**Use ERS App Trigger When**:
- You need a simple webhook endpoint
- You'll manually configure webhooks in ERS App UI
- You want full control over webhook configuration
- Testing webhook payloads during development

**Use ERS App Webhook Trigger When**:
- You want automatic webhook registration
- You need entity and event filtering
- You want n8n to manage webhook lifecycle
- Production deployments with multiple entity types

---

## Webhook Nodes

### 1. ERS App Trigger (Basic)

Simple webhook endpoint that accepts any POST request.

**Features**:
- ✅ Simple setup
- ✅ Manual webhook configuration
- ✅ Challenge verification support
- ❌ No automatic registration
- ❌ No entity/event filtering

**Webhook URL Format**:
```
http://your-n8n-instance:5678/webhook/ersapp
```

**Configuration**:
- No parameters required
- Configure webhook manually in ERS App UI
- Point ERS webhooks to the generated URL

---

### 2. ERS App Webhook Trigger (Advanced)

Advanced webhook with automatic registration and event filtering.

**Features**:
- ✅ Automatic webhook registration
- ✅ Entity and event filtering
- ✅ Webhook lifecycle management
- ✅ URL override for local development
- ✅ Automatic trigger updates
- ✅ Graceful deletion handling

**Webhook URL Format**:
```
http://your-n8n-instance:5678/webhook/ersapp-webhook
```

**Configuration Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `webhookUrlOverride` | string | No | Override webhook URL host (for ngrok, tunneling) |
| `entities` | multiOptions | Yes | Entity types to monitor (Resource, Project, etc.) |
| `events` | multiOptions | Yes | Event types to trigger on (Create, Update, Delete, etc.) |

---

## Setup Guide

### Quick Start: ERS App Trigger

1. **Create Workflow**:
   - Open n8n
   - Create new workflow
   - Name it: "ERS: Simple Webhook"

2. **Add Node**:
   - Click "+" to add node
   - Search for "ERS App Trigger"
   - Add to workflow

3. **Get Webhook URL**:
   - Save workflow
   - Activate workflow
   - Copy the "Test URL" or "Production URL"

4. **Configure in ERS App**:
   - Go to ERS App admin panel
   - Navigate to Webhooks section
   - Create new webhook
   - Paste the webhook URL
   - Configure entities and events
   - Save

5. **Test**:
   - Trigger an event in ERS App (e.g., create a resource)
   - Check n8n execution log

---

### Quick Start: ERS App Webhook Trigger

1. **Configure OAuth2 Credentials**:
   - Go to Credentials in n8n
   - Create "ERS App OAuth2 API" credential
   - Complete OAuth2 flow
   - Save credentials

2. **Create Workflow**:
   - Create new workflow
   - Name it: "ERS: Auto Webhook"

3. **Add Node**:
   - Search for "ERS App Webhook Trigger"
   - Add to workflow

4. **Configure Node**:
   - **Credentials**: Select your ERS OAuth2 credentials
   - **Entities**: Select entities to monitor
     - Example: Resource, Project
   - **Events**: Select events to trigger on
     - Example: Create, Update
   - **Webhook URL Override**: (leave empty for production)

5. **Activate Workflow**:
   - Save workflow
   - Click "Activate" toggle
   - Node automatically registers webhook in ERS App

6. **Verify**:
   - Check n8n logs for registration success
   - Trigger an event in ERS App
   - Verify workflow executes

---

## Entity and Event Configuration

### Supported Entities

| Entity Name | Entity ID | Description |
|-------------|-----------|-------------|
| Resource | 1 | People, equipment, or assets |
| Project | 2 | Projects and initiatives |
| Booking | 4 | Resource bookings/allocations |
| Role Rate | 8 | Role-based rates |
| Timesheet | 16 | Time tracking entries |
| Requirement | 32 | Resource requirements |

### Supported Events

| Event Name | Event ID | Description | Applicable Entities |
|------------|----------|-------------|---------------------|
| Create | 1 | Entity created | All except Timesheet |
| Update | 2 | Entity updated | All except Timesheet |
| Delete | 3 | Entity deleted | All except Timesheet |
| Add Task | 4 | Task added | Project only |
| Edit Task | 5 | Task edited | Project only |
| Delete Task | 6 | Task deleted | Project only |
| Add Rate | 7 | Rate added | Resource, Project, Timesheet |
| Edit Rate | 8 | Rate edited | Resource, Project, Timesheet |
| Delete Rate | 9 | Rate deleted | Resource, Project, Timesheet |

### Entity-Event Compatibility Matrix

```
              Create Update Delete AddTask EditTask DelTask AddRate EditRate DelRate
              (1)    (2)    (3)    (4)     (5)      (6)     (7)     (8)      (9)
Resource      ✅     ✅     ✅     ❌      ❌       ❌      ✅      ✅       ✅
Project       ✅     ✅     ✅     ✅      ✅       ✅      ✅      ✅       ✅
Booking       ✅     ✅     ✅     ❌      ❌       ❌      ❌      ❌       ❌
Role Rate     ✅     ✅     ✅     ❌      ❌       ❌      ❌      ❌       ❌
Timesheet     ❌     ❌     ❌     ❌      ❌       ❌      ✅      ✅       ✅
Requirement   ✅     ✅     ✅     ❌      ❌       ❌      ❌      ❌       ❌
```

### Configuration Examples

**Example 1: Monitor Resource Creation**
```javascript
{
  "entities": [1],        // Resource
  "events": [1]           // Create
}
```

**Example 2: Monitor All Project Events**
```javascript
{
  "entities": [2],        // Project
  "events": [1, 2, 3, 4, 5, 6, 7, 8, 9]  // All events
}
```

**Example 3: Monitor Resource and Booking Changes**
```javascript
{
  "entities": [1, 4],     // Resource, Booking
  "events": [1, 2, 3]     // Create, Update, Delete
}
```

**Example 4: Monitor Rate Changes Across Entities**
```javascript
{
  "entities": [1, 2, 16], // Resource, Project, Timesheet
  "events": [7, 8, 9]     // Add Rate, Edit Rate, Delete Rate
}
```

---

## Webhook Lifecycle

### Registration Process (ERS App Webhook Trigger)

When you activate a workflow with the ERS App Webhook Trigger:

```
1. Workflow Activation
   ↓
2. Get webhook URL from n8n
   ↓
3. Apply URL override (if configured)
   ↓
4. Check if webhook already exists
   ├─ GET /rest/webhooks
   └─ Match by URL
   ↓
5. Create webhook (if not exists)
   ├─ POST /rest/webhooks
   └─ Payload: { name, status, signed, url }
   ↓
6. Get webhook ID
   ↓
7. Update triggers
   ├─ Filter events for each entity
   ├─ POST /rest/webhooks/{id}/triggers
   └─ Payload: { status, triggers }
   ↓
8. Store webhook ID in workflow static data
   ↓
9. Webhook ready to receive events
```

### Update Process

When you change entities or events and save the workflow:

```
1. Workflow saved with changes
   ↓
2. checkExists() returns false (forced)
   ↓
3. create() method called
   ↓
4. Webhook already exists (detected)
   ↓
5. Skip webhook creation
   ↓
6. Update triggers with new configuration
   ↓
7. Webhook now listens to new entities/events
```

### Deletion Process

When you deactivate or delete the workflow:

```
1. Workflow deactivation/deletion
   ↓
2. delete() method called
   ↓
3. Check if workflow deactivation or node deletion
   ├─ Deactivation: Skip deletion (webhook persists)
   └─ Node deletion: Proceed with deletion
   ↓
4. Get webhook ID from static data
   ↓
5. Delete webhook from ERS App
   ├─ DELETE /rest/webhooks/{id}?force_delete_logs=true&force_delete_triggers=true
   └─ Handle 404 gracefully
   ↓
6. Clear webhook ID from static data
```

### Webhook State Management

Webhook state is stored in workflow static data:

```javascript
// Accessing webhook ID
const staticData = this.getWorkflowStaticData('node');
const webhookId = staticData.webhookId;

// Storing webhook ID
staticData.webhookId = 123;

// Clearing webhook ID
delete staticData.webhookId;
```

---

## Local Development

### Challenge: Localhost Not Accessible

ERS App server cannot reach `http://localhost:5678` for webhook verification and events.

### Solution 1: Use ngrok (Recommended)

**Install ngrok**:
```bash
# macOS
brew install ngrok

# Linux
sudo snap install ngrok

# Windows
choco install ngrok
```

**Start ngrok tunnel**:
```bash
ngrok http 5678
```

**Output**:
```
Forwarding   http://abc123.ngrok.io -> http://localhost:5678
Forwarding   https://abc123.ngrok.io -> http://localhost:5678
```

**Configure in n8n**:
1. Open your workflow
2. Edit ERS App Webhook Trigger node
3. Set **Webhook URL Override**: `abc123.ngrok.io`
4. Save and activate

**Result**:
- Generated URL: `http://localhost:5678/webhook/ersapp-webhook`
- Sent to ERS: `http://abc123.ngrok.io:5678/webhook/ersapp-webhook`

---

### Solution 2: Use localtunnel

```bash
npx localtunnel --port 5678
```

Configure in node: Use the provided subdomain (e.g., `your-subdomain.loca.lt`)

---

### Solution 3: Use n8n Cloud

Deploy n8n to cloud with public URL. No tunnel needed.

---

### Solution 4: Configure VPN/Port Forwarding

Set up VPN or port forwarding between ERS App server and your development machine.

---

## Production Deployment

### Requirements

1. **Public n8n Instance**:
   - Accessible from ERS App server
   - HTTPS enabled (recommended)
   - Stable URL (no changing IPs)

2. **Network Configuration**:
   - Firewall allows incoming connections
   - No blocking by security groups
   - DNS properly configured

3. **SSL Certificate** (recommended):
   - Use Let's Encrypt or purchased cert
   - Configure in n8n or reverse proxy

### Deployment Options

#### Option 1: Docker with Reverse Proxy

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - n8n

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

**nginx.conf** (simplified):
```nginx
server {
    listen 443 ssl;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://n8n:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option 2: n8n Cloud

Simplest option:
1. Sign up at n8n.cloud
2. Deploy instance
3. Public URL provided automatically
4. No infrastructure management

#### Option 3: Platform-as-a-Service

Deploy to:
- Heroku
- Railway.app
- Render
- Digital Ocean App Platform

---

### Production Configuration

**Environment Variables**:
```bash
# n8n configuration
N8N_HOST=n8n.yourdomain.com
N8N_PROTOCOL=https
N8N_PORT=5678

# Webhook configuration
WEBHOOK_URL=https://n8n.yourdomain.com

# Security
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=strong_password_here

# Execution
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600
```

**n8n Node Configuration**:
- **Webhook URL Override**: Leave empty (use auto-generated URL)
- **Entities**: Select required entities only
- **Events**: Select required events only

---

## Webhook Payload Structure

### Challenge Request (Verification)

ERS App sends a challenge request to verify the webhook URL.

**Request**:
```http
POST /webhook/ersapp-webhook
Content-Type: application/json

{
  "challenge": "a1b2c3d4e5f6"
}
```

**Expected Response**:
```json
{
  "challenge": "a1b2c3d4e5f6"
}
```

**Handling**: Both webhook trigger nodes automatically handle challenge requests.

---

### Event Payload

**Standard Event Structure**:
```json
{
  "event": "create",
  "entity": "resource",
  "entity_id": 123,
  "data": {
    // Entity-specific data
  },
  "timestamp": "2024-01-10T14:30:00Z",
  "user": {
    "id": 456,
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### Entity-Specific Payloads

#### Resource Events

**Create Event**:
```json
{
  "event": "create",
  "entity": "resource",
  "entity_id": 123,
  "data": {
    "id": 123,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "resource_type_id": 1,
    "start_date": "2024-01-15",
    "last_date": null,
    "calendar_id": 1,
    "created_at": "2024-01-10T14:30:00Z"
  },
  "timestamp": "2024-01-10T14:30:00Z"
}
```

**Update Event**:
```json
{
  "event": "update",
  "entity": "resource",
  "entity_id": 123,
  "data": {
    "id": 123,
    "email": "jane.smith.new@example.com",
    "phone": "+1234567899",
    "updated_at": "2024-01-11T10:00:00Z"
  },
  "changes": {
    "email": {
      "old": "jane.smith@example.com",
      "new": "jane.smith.new@example.com"
    },
    "phone": {
      "old": "+1234567890",
      "new": "+1234567899"
    }
  },
  "timestamp": "2024-01-11T10:00:00Z"
}
```

**Delete Event**:
```json
{
  "event": "delete",
  "entity": "resource",
  "entity_id": 123,
  "data": {
    "id": 123
  },
  "timestamp": "2024-01-12T09:00:00Z"
}
```

#### Rate Events

**Add Rate**:
```json
{
  "event": "add_rate",
  "entity": "resource",
  "entity_id": 123,
  "data": {
    "rate_id": 789,
    "resource_id": 123,
    "rate_amount": 150.00,
    "currency": "USD",
    "effective_date": "2024-02-01",
    "created_at": "2024-01-10T14:30:00Z"
  },
  "timestamp": "2024-01-10T14:30:00Z"
}
```

---

## Troubleshooting

### Issue 1: Webhook Not Receiving Events

**Symptoms**:
- Workflow doesn't execute
- No errors in n8n logs
- Events occurring in ERS App

**Debug Steps**:

1. **Check Workflow Status**:
   ```
   - Is workflow active? (toggle should be ON)
   - Is webhook trigger node properly configured?
   ```

2. **Verify Webhook Registration**:
   ```bash
   # Check n8n logs for registration
   docker logs n8n | grep "ERS Webhook"
   
   # Look for:
   # [ERS Webhook] Webhook successfully registered
   # [ERS Webhook] Webhook ID: {id}
   ```

3. **Test Webhook URL**:
   ```bash
   # Test with curl
   curl -X POST \
     http://your-n8n-instance:5678/webhook/ersapp-webhook \
     -H 'Content-Type: application/json' \
     -d '{"test": true}'
   ```

4. **Check ERS App Logs**:
   - Are webhooks being sent?
   - Any errors from ERS App side?

5. **Verify Network**:
   - Can ERS App server reach n8n instance?
   ```bash
   # From ERS App server
   curl http://your-n8n-instance:5678/webhook/ersapp-webhook
   ```

**Solutions**:
- Activate workflow
- Re-register webhook (deactivate and reactivate)
- Check firewall rules
- Verify webhook URL override
- Check n8n logs for errors

---

### Issue 2: Challenge Verification Failing

**Symptoms**:
- Webhook registration fails
- ERS App shows "URL verification failed"

**Causes**:
- n8n instance not accessible
- Challenge response incorrect
- Timeout during verification

**Solutions**:

1. **Test Challenge Manually**:
   ```bash
   # Send challenge request
   curl -X POST \
     http://your-n8n-instance:5678/webhook/ersapp-webhook \
     -H 'Content-Type: application/json' \
     -d '{"challenge": "test123"}'
   
   # Expected response:
   # {"challenge": "test123"}
   ```

2. **Check Webhook Code**:
   - Verify challenge handling in webhook() method
   - Ensure correct response format

3. **Network**:
   - Use ngrok for local development
   - Verify public URL accessibility
   - Check SSL certificate if using HTTPS

---

### Issue 3: Events Not Triggering for Specific Entity

**Symptoms**:
- Some events trigger, others don't
- Specific entity events missing

**Cause**: Invalid event for entity type

**Solution**:

Check entity-event compatibility matrix. Example:
```
Timesheet only supports events: 7, 8, 9 (Rate events)
Selecting events 1, 2, 3 for Timesheet will be filtered out
```

**Verify**:
```bash
# Check n8n logs
docker logs n8n | grep "Filtered out invalid events"

# Example log:
# [ERS Webhook] Entity 16: Filtered out invalid events: 1, 2, 3
```

---

### Issue 4: Webhook ID Not Found

**Symptoms**:
- Error: "Webhook created but could not find it in the list"
- Webhook registration fails

**Cause**:
- Timing issue (webhook not yet in GET response)
- URL mismatch
- API error

**Solutions**:

1. **Check ERS App Webhooks**:
   - Log into ERS App admin
   - Check webhooks list
   - Verify webhook was created

2. **Manual Registration**:
   - Delete webhook from ERS App
   - Deactivate workflow
   - Reactivate workflow

3. **URL Matching**:
   - Ensure webhookUrlOverride matches exactly
   - Check for trailing slashes
   - Verify protocol (http vs https)

---

### Issue 5: Duplicate Webhooks Created

**Symptoms**:
- Multiple webhooks with same URL in ERS App
- Events trigger multiple times

**Cause**:
- Workflow duplicated
- Manual webhook creation + auto registration

**Solutions**:

1. **Clean Up**:
   - Delete duplicate webhooks from ERS App
   - Keep only one webhook per URL

2. **Prevent**:
   - Don't manually create webhooks when using auto-registration
   - Use unique workflow names
   - Check existing webhooks before activating

---

## Advanced Topics

### Custom Event Filtering

Filter events in n8n after receiving:

```javascript
// Function node after webhook trigger
const event = $json.event;
const entity = $json.entity;
const data = $json.data;

// Filter: Only process resources with specific type
if (entity === 'resource' && data.resource_type_id !== 1) {
  // Don't process this event
  return null;
}

// Filter: Only process high-priority projects
if (entity === 'project' && data.priority !== 'high') {
  return null;
}

// Process event
return $input.all();
```

---

### Event Deduplication

Prevent duplicate processing:

```javascript
// Function node
const eventId = $json.entity + '_' + $json.entity_id + '_' + $json.timestamp;
const staticData = this.getWorkflowStaticData('global');

// Initialize processed events set
if (!staticData.processedEvents) {
  staticData.processedEvents = {};
}

// Check if already processed
if (staticData.processedEvents[eventId]) {
  console.log('Duplicate event, skipping:', eventId);
  return null;
}

// Mark as processed
staticData.processedEvents[eventId] = Date.now();

// Clean up old events (keep last 1000)
const eventIds = Object.keys(staticData.processedEvents);
if (eventIds.length > 1000) {
  eventIds.sort((a, b) => 
    staticData.processedEvents[a] - staticData.processedEvents[b]
  );
  eventIds.slice(0, eventIds.length - 1000).forEach(id => {
    delete staticData.processedEvents[id];
  });
}

return $input.all();
```

---

### Event Aggregation

Batch events for processing:

```javascript
// Use n8n's Schedule Trigger + Static Data

// Webhook Trigger -> Function (Store Events)
const staticData = this.getWorkflowStaticData('global');
if (!staticData.pendingEvents) {
  staticData.pendingEvents = [];
}
staticData.pendingEvents.push($json);
return null; // Don't continue workflow

// Schedule Trigger (every 5 minutes) -> Function (Process Batch)
const staticData = this.getWorkflowStaticData('global');
const events = staticData.pendingEvents || [];
staticData.pendingEvents = []; // Clear

return events.map(event => ({ json: event }));
```

---

### Webhook Monitoring

Monitor webhook health:

```javascript
// Schedule Trigger (hourly) -> HTTP Request

// GET /rest/webhooks
const webhooks = await $http.request({
  method: 'GET',
  url: 'http://192.168.1.201:8080/rest/webhooks',
  headers: {
    Authorization: 'Bearer ' + $credentials.accessToken
  }
});

// Check webhook status
const n8nWebhook = webhooks.data.find(wh => 
  wh.url.includes('n8n')
);

if (!n8nWebhook) {
  // Webhook not found - alert
  return [{
    json: {
      alert: 'Webhook not registered!',
      timestamp: new Date().toISOString()
    }
  }];
}

if (!n8nWebhook.status) {
  // Webhook disabled - alert
  return [{
    json: {
      alert: 'Webhook is disabled!',
      webhookId: n8nWebhook.id,
      timestamp: new Date().toISOString()
    }
  }];
}

// Webhook OK
return [{
  json: {
    status: 'OK',
    webhookId: n8nWebhook.id,
    timestamp: new Date().toISOString()
  }
}];
```

---

## Security Best Practices

### 1. Use HTTPS in Production

```javascript
// Always use HTTPS for webhooks in production
WEBHOOK_URL=https://n8n.yourdomain.com
```

### 2. Implement Request Validation

```javascript
// Function node: Validate webhook payload
const requiredFields = ['event', 'entity', 'entity_id'];
const missingFields = requiredFields.filter(field => !(field in $json));

if (missingFields.length > 0) {
  throw new Error('Invalid payload: missing ' + missingFields.join(', '));
}

return $input.all();
```

### 3. Rate Limiting

```javascript
// Implement rate limiting in Function node
const staticData = this.getWorkflowStaticData('global');
const now = Date.now();
const windowMs = 60000; // 1 minute
const maxRequests = 100;

if (!staticData.requests) {
  staticData.requests = [];
}

// Remove old requests outside window
staticData.requests = staticData.requests.filter(time => 
  now - time < windowMs
);

// Check rate limit
if (staticData.requests.length >= maxRequests) {
  throw new Error('Rate limit exceeded');
}

// Add current request
staticData.requests.push(now);

return $input.all();
```

### 4. IP Whitelisting

Configure in nginx or n8n:

```nginx
# nginx.conf
location /webhook/ {
    allow 192.168.1.201; # ERS App server IP
    deny all;
    proxy_pass http://n8n:5678;
}
```

---

## Further Reading

- [API Documentation](./API.md)
- [Usage Guide](./USAGE.md)
- [Credentials Setup](./CREDENTIALS.md)
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

**Last Updated**: November 28, 2025
