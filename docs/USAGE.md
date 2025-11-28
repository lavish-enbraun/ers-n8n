# Usage Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Workflows](#basic-workflows)
- [Advanced Workflows](#advanced-workflows)
- [Common Use Cases](#common-use-cases)
- [Best Practices](#best-practices)
- [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

### Prerequisites

Before using the ERS App nodes in n8n, ensure you have:

1. **n8n installed and running** (v0.210.0 or higher)
2. **ERS App OAuth2 credentials** configured
3. **Network connectivity** between n8n and ERS App API
4. **Valid ERS App account** with appropriate permissions

### Installation

#### Option 1: Install from npm (Recommended for Production)

```bash
npm install n8n-nodes-ers-app
```

#### Option 2: Local Development

```bash
git clone https://github.com/lavish-enbraun/ers-n8n.git
cd ers-n8n
npm install
npm run build
export N8N_CUSTOM_EXTENSIONS=$(pwd)
n8n start
```

### First-Time Setup

1. **Configure Credentials**:
   - Go to **Credentials** in n8n
   - Click **New Credential**
   - Search for "ERS App OAuth2 API"
   - Click **Connect my account**
   - Complete OAuth2 authorization

2. **Test Connection**:
   - Create a new workflow
   - Add an "Ers App" node
   - Select your credentials
   - Choose "Get Many" operation
   - Execute the node

---

## Basic Workflows

### 1. List All Resources

**Goal**: Fetch all resources from ERS App

**Nodes Required**:
- Schedule Trigger (or Manual Trigger)
- Ers App

**Configuration**:

```
┌─────────────────┐
│ Schedule Trigger│
│ Every day 9 AM  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Ers App      │
│ Resource: Get   │
│    Many         │
│ Return All: Yes │
└─────────────────┘
```

**Steps**:

1. Add **Schedule Trigger** node
   - Set interval: Daily at 9:00 AM

2. Add **Ers App** node
   - Credentials: Select your ERS App OAuth2 credentials
   - Resource: `Resource`
   - Operation: `Get Many`
   - Return All: `true`

3. **Execute**

**Expected Output**:

```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "resource_type_id": 1,
    "start_date": "2024-01-01"
  },
  {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "resource_type_id": 1,
    "start_date": "2024-01-15"
  }
]
```

---

### 2. Create a Single Resource

**Goal**: Create a new resource in ERS App

**Nodes Required**:
- Manual Trigger
- Ers App

**Configuration**:

```
┌─────────────────┐
│ Manual Trigger  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Ers App      │
│ Resource: Create│
└─────────────────┘
```

**Steps**:

1. Add **Manual Trigger** node

2. Add **Ers App** node
   - Resource: `Resource`
   - Operation: `Create`
   - First Name: `Alice`
   - Last Name: `Johnson`
   - Start Date: `2024-02-01`
   - Resource Type ID: `1`
   - Additional Fields:
     - Email: `alice.johnson@example.com`
     - Phone: `+1234567890`

3. **Execute**

**Expected Output**:

```json
{
  "id": 456,
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1234567890",
  "resource_type_id": 1,
  "start_date": "2024-02-01",
  "created_at": "2024-01-10T10:30:00Z"
}
```

---

### 3. Receive Webhook Events

**Goal**: Trigger workflow when a resource is created or updated in ERS App

**Nodes Required**:
- ERS App Webhook Trigger
- Set (optional, for data transformation)
- Email (or any action node)

**Configuration**:

```
┌─────────────────────┐
│ ERS App Webhook     │
│ Trigger             │
│ Entity: Resource    │
│ Events: Create,     │
│         Update      │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│        Set          │
│ Extract resource    │
│ details             │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│       Email         │
│ Send notification   │
└─────────────────────┘
```

**Steps**:

1. Add **ERS App Webhook Trigger** node
   - Entities: Select `Resource`
   - Events: Select `Create`, `Update`
   - Webhook URL Override: (leave empty for production, or use ngrok URL for local dev)

2. Add **Set** node (optional)
   - Add field mapping to extract specific data

3. Add **Email** node
   - To: `admin@example.com`
   - Subject: `New Resource: {{ $json.data.first_name }} {{ $json.data.last_name }}`
   - Message: `A new resource was created with ID: {{ $json.data.id }}`

4. **Activate** workflow

**Webhook Event Example**:

```json
{
  "event": "create",
  "entity": "resource",
  "entity_id": 123,
  "data": {
    "id": 123,
    "first_name": "Bob",
    "last_name": "Wilson",
    "email": "bob.wilson@example.com",
    "resource_type_id": 1,
    "start_date": "2024-03-01"
  },
  "timestamp": "2024-01-10T14:30:00Z"
}
```

---

## Advanced Workflows

### 4. Bulk Import Resources from Google Sheets

**Goal**: Import multiple resources from a Google Sheet

**Nodes Required**:
- Schedule Trigger
- Google Sheets
- Function
- Ers App (POST Many)

**Workflow**:

```
┌─────────────────┐
│ Schedule Trigger│
│ Daily at 2 AM   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Google Sheets   │
│ Read rows       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Function     │
│ Transform data  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Ers App      │
│ Resource: POST  │
│    Many         │
└─────────────────┘
```

**Steps**:

1. **Schedule Trigger**
   - Interval: Daily at 2:00 AM

2. **Google Sheets** node
   - Operation: `Read Rows`
   - Document: Your Google Sheet
   - Sheet: `Resources`
   - Range: `A2:F100` (assuming headers in row 1)

3. **Function** node (JavaScript)
   ```javascript
   // Transform Google Sheets data to ERS format
   const items = $input.all();
   const transformedItems = items.map(item => {
     return {
       json: {
         first_name: item.json['First Name'],
         last_name: item.json['Last Name'],
         email: item.json['Email'],
         phone: item.json['Phone'],
         resource_type_id: parseInt(item.json['Resource Type ID']),
         start_date: new Date(item.json['Start Date']).toISOString().split('T')[0]
       }
     };
   });
   
   return transformedItems;
   ```

4. **Ers App** node
   - Resource: `Resource`
   - Operation: `POST Many`

**Google Sheet Format**:

| First Name | Last Name | Email | Phone | Resource Type ID | Start Date |
|------------|-----------|-------|-------|------------------|------------|
| John | Doe | john@example.com | +1234567890 | 1 | 2024-01-01 |
| Jane | Smith | jane@example.com | +1234567891 | 1 | 2024-01-15 |

---

### 5. Sync Resources with External CRM

**Goal**: Two-way sync between ERS App and an external CRM (e.g., HubSpot)

**Workflow A: ERS → CRM** (When resource created in ERS)

```
┌─────────────────────┐
│ ERS Webhook Trigger │
│ Entity: Resource    │
│ Event: Create       │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│     Function        │
│ Map ERS → CRM       │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│      HubSpot        │
│ Create Contact      │
└─────────────────────┘
```

**Workflow B: CRM → ERS** (When contact created in CRM)

```
┌─────────────────────┐
│  HubSpot Trigger    │
│  Contact Created    │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│     Function        │
│ Map CRM → ERS       │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│     Ers App         │
│ Resource: Create    │
└─────────────────────┘
```

**Function Node (ERS → CRM)**:

```javascript
// Map ERS resource to CRM contact
const ersResource = $json.data;

return {
  json: {
    properties: {
      firstname: ersResource.first_name,
      lastname: ersResource.last_name,
      email: ersResource.email,
      phone: ersResource.phone,
      ers_resource_id: ersResource.id,
      ers_start_date: ersResource.start_date
    }
  }
};
```

---

### 6. Automated Resource Onboarding

**Goal**: Complete onboarding workflow when a new resource is created

**Workflow**:

```
┌─────────────────────┐
│ ERS Webhook Trigger │
│ Entity: Resource    │
│ Event: Create       │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           v                 v
┌──────────────────┐  ┌─────────────────┐
│ Gmail            │  │ Slack           │
│ Send welcome     │  │ Post to         │
│ email            │  │ #new-hires      │
└──────────────────┘  └─────────────────┘
           │                 │
           └────────┬────────┘
                    │
                    v
           ┌─────────────────┐
           │ Google Calendar │
           │ Schedule        │
           │ orientation     │
           └─────────────────┘
```

**Benefits**:
- Automated welcome emails
- Slack notifications to team
- Automatic calendar invites
- Consistent onboarding experience

---

### 7. Resource Availability Report

**Goal**: Generate weekly report of resource availability

**Workflow**:

```
┌─────────────────┐
│ Schedule Trigger│
│ Every Friday    │
│ 5 PM            │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Ers App      │
│ Get All         │
│ Resources       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Function     │
│ Filter active   │
│ resources       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Spreadsheet File│
│ Generate CSV    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│     Email       │
│ Send report     │
└─────────────────┘
```

**Function Node (Filter Active Resources)**:

```javascript
const now = new Date();
const items = $input.all();

// Filter resources that are currently active
const activeResources = items.filter(item => {
  const resource = item.json;
  const startDate = new Date(resource.start_date);
  const lastDate = resource.last_date ? new Date(resource.last_date) : null;
  
  // Resource has started and not yet ended
  return startDate <= now && (!lastDate || lastDate >= now);
});

return activeResources;
```

---

## Common Use Cases

### Use Case 1: Onboarding Automation

**Scenario**: Automatically create user accounts and access when a resource is added

**Steps**:
1. Webhook trigger on resource creation
2. Create Active Directory account
3. Send credentials via email
4. Create entries in access control systems
5. Notify IT team

**Benefits**:
- Reduces manual work
- Faster onboarding
- Consistent access provisioning
- Audit trail

---

### Use Case 2: Offboarding Automation

**Scenario**: Revoke access when a resource's last date is reached

**Steps**:
1. Schedule trigger (daily)
2. Get all resources
3. Filter resources with last_date = today
4. For each resource:
   - Disable Active Directory account
   - Revoke system access
   - Notify IT team
   - Archive resource data

---

### Use Case 3: Resource Utilization Tracking

**Scenario**: Track and report on resource allocation

**Steps**:
1. Webhook trigger on booking events
2. Log booking data to database/spreadsheet
3. Generate weekly utilization reports
4. Alert on under/over-utilized resources

---

### Use Case 4: Compliance Reporting

**Scenario**: Generate compliance reports for auditing

**Steps**:
1. Schedule trigger (monthly)
2. Get all resources and their activities
3. Generate compliance report
4. Send to compliance team
5. Archive report

---

## Best Practices

### 1. Error Handling

Always add error handling to your workflows:

```
┌─────────────────┐
│    Try/Catch    │
└────────┬────────┘
         │
         ├─── Success ──→ Continue workflow
         │
         └─── Error ────→ ┌──────────────┐
                          │ Send alert   │
                          │ Log error    │
                          └──────────────┘
```

**Implementation**:
- Use n8n's "Error Trigger" node
- Set up error workflows
- Log errors to monitoring system
- Send alerts to appropriate team

---

### 2. Pagination for Large Datasets

When fetching many resources:

```javascript
// Use pagination instead of "Return All"
// Process in batches of 100

let offset = 0;
const limit = 100;
let hasMore = true;
const allResources = [];

while (hasMore) {
  const response = await fetchResources(limit, offset);
  allResources.push(...response.data);
  
  hasMore = response.data.length === limit;
  offset += limit;
  
  // Add delay to avoid rate limiting
  await sleep(1000);
}
```

---

### 3. Webhook URL Management

For local development:

**Use ngrok**:
```bash
ngrok http 5678
```

**Configure in node**:
- Webhook URL Override: `your-subdomain.ngrok.io`

For production:
- Use proper domain with SSL
- Keep Webhook URL Override empty
- Ensure n8n is accessible from ERS App server

---

### 4. Credential Management

**Security**:
- Use separate credentials for dev/staging/prod
- Rotate credentials periodically
- Limit OAuth2 scopes to minimum required
- Never hardcode credentials

**Organization**:
- Name credentials clearly: "ERS Prod", "ERS Dev"
- Document which workflows use which credentials
- Test credentials regularly

---

### 5. Workflow Organization

**Naming**:
- Use descriptive names: "ERS: Daily Resource Sync"
- Include environment: "ERS Prod: Onboarding"
- Version workflows: "ERS: Import v2"

**Documentation**:
- Add notes to complex nodes
- Document data transformations
- Keep a workflow changelog

**Folder Structure**:
```
Workflows/
├── ERS/
│   ├── Production/
│   │   ├── Resource Sync
│   │   ├── Onboarding Automation
│   │   └── Weekly Reports
│   ├── Staging/
│   │   └── Test Workflows
│   └── Development/
│       └── Experiments
```

---

### 6. Testing

**Development Testing**:
1. Test with manual trigger first
2. Use small datasets
3. Verify transformations with Function node
4. Check outputs at each step

**Production Testing**:
1. Deploy to staging first
2. Test with real-ish data
3. Monitor for errors
4. Gradual rollout

**Webhook Testing**:
```bash
# Test webhook endpoint
curl -X POST \
  http://localhost:5678/webhook/ersapp-webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "event": "create",
    "entity": "resource",
    "data": {
      "id": 123,
      "first_name": "Test",
      "last_name": "User"
    }
  }'
```

---

### 7. Performance Optimization

**Batch Operations**:
- Use POST Many for bulk creates
- Process items in batches
- Use Loop Over Items with batch size

**Caching**:
- Cache frequently accessed data
- Use workflow static data for state
- Implement cache invalidation

**Async Processing**:
- Use sub-workflows for long operations
- Implement queue-based processing
- Handle timeouts gracefully

---

## Tips and Tricks

### Tip 1: Dynamic Field Mapping

Use expressions to dynamically map fields:

```javascript
// In Set node
{
  "first_name": "={{ $json.firstName }}",
  "last_name": "={{ $json.lastName }}",
  "email": "={{ $json.email }}",
  "start_date": "={{ new Date($json.hireDate).toISOString().split('T')[0] }}"
}
```

---

### Tip 2: Conditional Execution

Use IF node to control flow:

```
┌─────────────────┐
│    Ers App      │
│ Get Resources   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│      IF         │
│ resource_type   │
│    == 1         │
└─────┬─────┬─────┘
      │     │
   True     False
      │     │
      v     v
```

---

### Tip 3: Date Handling

ERS App uses YYYY-MM-DD format. Convert dates:

```javascript
// JavaScript in Function node
const date = new Date('2024-01-15T10:30:00Z');
const ersDate = date.toISOString().split('T')[0]; // "2024-01-15"

// In expressions
{{ new Date($json.date).toISOString().split('T')[0] }}
```

---

### Tip 4: Debugging Webhooks

Enable detailed logging:

```javascript
// In Function node after webhook trigger
console.log('Webhook received:', JSON.stringify($json, null, 2));
return $input.all();
```

Check n8n logs:
```bash
# Docker
docker logs n8n | grep "ERS Webhook"

# Local
tail -f ~/.n8n/logs/n8n.log | grep "ERS Webhook"
```

---

### Tip 5: Rate Limiting

Add delays between API calls:

```
┌─────────────────┐
│    Loop Over    │
│    Items        │
└────────┬────────┘
         │
         v
┌─────────────────┐
│    Ers App      │
│ Create Resource │
└────────┬────────┘
         │
         v
┌─────────────────┐
│     Wait        │
│   1 second      │
└─────────────────┘
```

---

### Tip 6: Handling Empty Responses

```javascript
// Function node
const items = $input.all();

if (!items || items.length === 0) {
  return [{
    json: {
      message: 'No resources found',
      count: 0,
      data: []
    }
  }];
}

return items;
```

---

### Tip 7: Environment Variables

Use environment variables for configuration:

```javascript
// In Function node
const baseUrl = $env.ERS_BASE_URL || 'http://192.168.1.201:8080';
const apiKey = $env.ERS_API_KEY;

// Access in workflow
{{ $env.ERS_RESOURCE_TYPE_ID }}
```

Set in n8n:
```bash
export ERS_BASE_URL="http://your-ers-server.com"
export ERS_RESOURCE_TYPE_ID="1"
```

---

## Example Workflow Exports

### Complete Onboarding Workflow

```json
{
  "name": "ERS: Complete Onboarding",
  "nodes": [
    {
      "name": "ERS Webhook Trigger",
      "type": "ersAppWebhookTrigger",
      "parameters": {
        "entities": [1],
        "events": [1]
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "emailSend",
      "parameters": {
        "to": "={{ $json.data.email }}",
        "subject": "Welcome to the Team!",
        "text": "Hi {{ $json.data.first_name }}, welcome!"
      }
    },
    {
      "name": "Notify Slack",
      "type": "slack",
      "parameters": {
        "channel": "#new-hires",
        "text": "New hire: {{ $json.data.first_name }} {{ $json.data.last_name }}"
      }
    }
  ]
}
```

---

## Troubleshooting Workflows

### Issue: Workflow Not Triggering

**Check**:
1. Is workflow active?
2. Are webhook triggers properly registered?
3. Check n8n logs for errors
4. Verify webhook URL is accessible

---

### Issue: Authentication Errors

**Solutions**:
1. Re-authenticate credentials
2. Check token expiration
3. Verify OAuth2 scopes
4. Test credentials with simple GET request

---

### Issue: Data Not Mapping Correctly

**Debug**:
1. Add Function node to inspect data
2. Use console.log liberally
3. Check data types (string vs number)
4. Verify field names match exactly

---

## Further Resources

- [API Documentation](./API.md)
- [Webhook Guide](./WEBHOOKS.md)
- [Credentials Setup](./CREDENTIALS.md)
- [n8n Community](https://community.n8n.io/)
- [n8n Documentation](https://docs.n8n.io/)

---

**Last Updated**: November 28, 2025
