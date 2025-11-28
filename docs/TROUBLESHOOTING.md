# Troubleshooting Guide

## Table of Contents

- [Common Issues](#common-issues)
- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [Webhook Issues](#webhook-issues)
- [API Request Issues](#api-request-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tools](#debugging-tools)
- [Getting Help](#getting-help)

---

## Common Issues

### Node Not Appearing in n8n

**Symptoms**:
- Can't find "Ers App" or "ERS App Trigger" in node list
- Nodes missing after installation

**Possible Causes**:
1. Package not installed correctly
2. n8n not restarted after installation
3. Custom extensions path not configured
4. Build errors

**Solutions**:

**Check Installation**:
```bash
# Verify package is installed
npm list n8n-nodes-ers-app

# Expected output:
# n8n-nodes-ers-app@0.1.0
```

**Check n8n Configuration**:
```bash
# For local development
echo $N8N_CUSTOM_EXTENSIONS

# Should output the path to your package
```

**Rebuild Package**:
```bash
cd /path/to/ers-n8n
npm run build

# Check for build errors
# Should create dist/ directory
```

**Restart n8n**:
```bash
# Stop n8n
pkill n8n

# Start n8n
n8n start
```

**Verify Node Loading**:
```bash
# Check n8n logs on startup
n8n start 2>&1 | grep -i "ers"

# Look for:
# Loaded node: ersApp
# Loaded credential: ersAppOAuth2Api
```

---

### Execution Errors

**Symptoms**:
- Node execution fails
- Red error indicator on node
- No output data

**Generic Debugging Steps**:

1. **Check Node Configuration**:
   - All required fields filled
   - Credentials selected
   - Valid input data

2. **Check Credentials**:
   - Credentials connected
   - Token not expired
   - Correct credentials selected

3. **Check Input Data**:
   - Previous node executed successfully
   - Data in expected format
   - Required fields present

4. **Check Error Message**:
   - Read full error message
   - Look for API error codes
   - Check for validation errors

5. **Test with Manual Trigger**:
   - Remove complex inputs
   - Test with simple data
   - Isolate the issue

---

## Installation Issues

### npm Install Fails

**Error**:
```
npm ERR! code ETARGET
npm ERR! notarget No matching version found
```

**Solution**:

1. **Check npm Registry**:
   ```bash
   npm config get registry
   # Should be: https://registry.npmjs.org/
   ```

2. **Clear npm Cache**:
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Check Node.js Version**:
   ```bash
   node --version
   # Should be v18 or higher
   ```

4. **Install Specific Version**:
   ```bash
   npm install n8n-nodes-ers-app@0.1.0
   ```

---

### Build Errors

**Error**:
```
error TS2307: Cannot find module 'n8n-workflow'
```

**Solution**:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Check TypeScript Version**:
   ```bash
   npx tsc --version
   # Should be 5.9.2 or compatible
   ```

3. **Clean Build**:
   ```bash
   rm -rf dist/ node_modules/
   npm install
   npm run build
   ```

---

### Permission Errors

**Error**:
```
EACCES: permission denied
```

**Solution**:

1. **Use sudo** (not recommended):
   ```bash
   sudo npm install
   ```

2. **Fix npm Permissions** (recommended):
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Use nvm** (best):
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install Node.js
   nvm install 18
   nvm use 18
   
   # Now install without sudo
   npm install
   ```

---

## Authentication Issues

### OAuth2 Connection Failed

**Error**:
```
Failed to connect. Please check your credentials.
```

**Debug Steps**:

1. **Check ERS App Accessibility**:
   ```bash
   curl http://192.168.1.201:8080/login/oauth/authorize
   
   # Should return HTML page or redirect
   # If timeout/connection refused, ERS App is not accessible
   ```

2. **Verify Client Credentials**:
   - Client ID: `121` (default)
   - Client Secret: `122` (default)
   - Contact ERS App admin to verify

3. **Check Redirect URI**:
   ```bash
   # Your n8n OAuth callback URL
   echo "http://$(hostname -I | awk '{print $1}'):5678/rest/oauth2-credential/callback"
   
   # Or if using domain
   echo "https://your-n8n-domain.com/rest/oauth2-credential/callback"
   ```

4. **Test OAuth Flow Manually**:
   ```bash
   # Step 1: Authorization URL
   open "http://192.168.1.201:8080/login/oauth/authorize?client_id=121&redirect_uri=http://localhost:5678/rest/oauth2-credential/callback&response_type=code&scope=users:read%20users:write%20companies:read"
   
   # After authorization, you'll get redirected with code
   # http://localhost:5678/rest/oauth2-credential/callback?code=ABC123
   
   # Step 2: Exchange code for token
   curl -X POST "http://192.168.1.201:8080/login/oauth/token?client_source=system" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=ABC123&redirect_uri=http://localhost:5678/rest/oauth2-credential/callback&client_id=121&client_secret=122"
   ```

---

### Access Token Not Found

**Error**:
```
OAuth2 access token not found. Please authenticate the credentials first.
```

**Causes**:
1. Credentials not saved after OAuth2 connection
2. Token storage issue
3. Credentials corrupted

**Solutions**:

1. **Reconnect Credentials**:
   - Go to Credentials
   - Open the ERS App credential
   - Click "Reconnect"
   - Complete OAuth2 flow
   - Click "Save"

2. **Create New Credential**:
   - Delete problematic credential
   - Create new credential
   - Connect and save

3. **Check Token Location**:
   ```javascript
   // Add Function node after ERS App node
   const credentials = await this.getCredentials('ersAppOAuth2Api');
   console.log('Credential keys:', Object.keys(credentials));
   
   // Expected keys include one of:
   // - access_token
   // - accessToken
   // - oauthTokenData.access_token
   ```

---

### Token Expired

**Error**:
```
401 Unauthorized
Token expired
```

**Solution**:

This should auto-refresh. If it doesn't:

1. **Manual Refresh**:
   - Go to Credentials
   - Open credential
   - Click "Reconnect"

2. **Check Refresh Token**:
   - Refresh tokens last 30-90 days
   - If expired, must re-authenticate

3. **Check Token Lifetime Settings**:
   - Contact ERS App admin
   - Verify token lifetime configuration

---

## Webhook Issues

### Webhook Not Receiving Events

**Symptoms**:
- Workflow doesn't trigger
- No executions in history
- Events occurring in ERS App

**Debug Checklist**:

- [ ] Workflow is active (toggle ON)
- [ ] Webhook trigger properly configured
- [ ] n8n is accessible from ERS App server
- [ ] Webhook registered in ERS App
- [ ] Correct entities and events selected
- [ ] No firewall blocking

**Debug Steps**:

1. **Verify Workflow Active**:
   ```
   - Workflow toggle should be green/ON
   - Check workflow executions tab for any activity
   ```

2. **Test Webhook URL Manually**:
   ```bash
   # Get webhook URL from n8n
   # Test with curl
   
   curl -X POST \
     http://your-n8n:5678/webhook/ersapp-webhook \
     -H 'Content-Type: application/json' \
     -d '{"test": true}'
   
   # Should trigger workflow
   # Check n8n execution history
   ```

3. **Check n8n Logs**:
   ```bash
   # Docker
   docker logs n8n | grep -i "webhook"
   
   # Local
   tail -f ~/.n8n/logs/n8n.log | grep -i "webhook"
   
   # Look for:
   # - Webhook registration messages
   # - Incoming webhook requests
   # - Errors
   ```

4. **Verify Network Connectivity**:
   ```bash
   # From ERS App server, test n8n accessibility
   curl -v http://your-n8n:5678/webhook/ersapp-webhook
   
   # Should return 200 OK or trigger workflow
   # If connection timeout/refused, network issue
   ```

5. **Check ERS App Webhook Configuration**:
   - Log into ERS App admin panel
   - Go to Webhooks section
   - Verify webhook exists
   - Check webhook status (should be enabled)
   - Verify URL matches n8n webhook URL
   - Check entities and events configuration

---

### Challenge Verification Failed

**Symptoms**:
- Webhook registration fails
- Error: "URL verification failed"
- Workflow doesn't activate

**Debug Steps**:

1. **Test Challenge Response**:
   ```bash
   # Send challenge request
   curl -X POST \
     http://your-n8n:5678/webhook/ersapp-webhook \
     -H 'Content-Type: application/json' \
     -d '{"challenge": "test123"}'
   
   # Expected response:
   # {"challenge": "test123"}
   ```

2. **Check n8n Logs**:
   ```bash
   docker logs n8n | grep -i "challenge"
   
   # Look for:
   # [ERS Webhook] Challenge token received
   # [ERS Webhook] Challenge detected
   ```

3. **Verify n8n Accessibility**:
   ```bash
   # ERS App must be able to reach n8n
   # From ERS App server:
   curl http://your-n8n:5678/webhook/ersapp-webhook
   ```

4. **Use ngrok for Local Development**:
   ```bash
   ngrok http 5678
   
   # Use ngrok URL in Webhook URL Override
   # Example: abc123.ngrok.io
   ```

---

### Webhook Triggers Multiple Times

**Symptoms**:
- Workflow executes multiple times for single event
- Duplicate executions

**Causes**:
1. Multiple webhooks registered with same URL
2. Workflow duplicated
3. Multiple workflow instances active

**Solutions**:

1. **Check for Duplicate Webhooks**:
   ```bash
   # Call ERS App API to list webhooks
   curl -X GET \
     http://192.168.1.201:8080/rest/webhooks \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Look for duplicate URLs
   ```

2. **Clean Up Webhooks**:
   - Log into ERS App admin
   - Delete duplicate webhooks
   - Keep only one webhook per URL

3. **Check n8n Workflows**:
   - Search for duplicate workflows
   - Deactivate or delete duplicates
   - Ensure only one workflow with same webhook trigger is active

4. **Implement Deduplication**:
   ```javascript
   // Function node after webhook trigger
   const staticData = this.getWorkflowStaticData('global');
   const eventId = $json.entity + '_' + $json.entity_id + '_' + $json.timestamp;
   
   if (!staticData.processed) {
     staticData.processed = {};
   }
   
   if (staticData.processed[eventId]) {
     console.log('Duplicate event detected:', eventId);
     return null; // Don't process
   }
   
   staticData.processed[eventId] = Date.now();
   
   // Clean old entries (keep last 1000)
   const keys = Object.keys(staticData.processed);
   if (keys.length > 1000) {
     keys.sort((a, b) => staticData.processed[a] - staticData.processed[b]);
     keys.slice(0, keys.length - 1000).forEach(k => {
       delete staticData.processed[k];
     });
   }
   
   return $input.all();
   ```

---

### Webhook Deletion Fails

**Error**:
```
Failed to delete webhook from server
```

**Solutions**:

1. **Manual Deletion**:
   - Log into ERS App admin
   - Go to Webhooks section
   - Find the webhook
   - Delete manually

2. **Force Delete**:
   ```bash
   # Using API
   curl -X DELETE \
     "http://192.168.1.201:8080/rest/webhooks/{ID}?force_delete_logs=true&force_delete_triggers=true" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Ignore Error**:
   - If webhook already deleted, error is harmless
   - Node deletion will complete anyway
   - Webhook ID cleared from workflow

---

## API Request Issues

### 404 Not Found

**Error**:
```
404 Not Found
The requested resource could not be found
```

**Causes**:
1. Incorrect endpoint URL
2. Resource doesn't exist
3. Wrong resource ID

**Debug**:

1. **Check Endpoint**:
   ```javascript
   // Expected format:
   http://192.168.1.201:8080/rest/v1/resources
   
   // Common mistakes:
   // - Missing /rest/v1
   // - Wrong base URL
   // - Typo in resource name
   ```

2. **Verify Resource Exists**:
   ```bash
   # List all resources
   curl -X GET \
     http://192.168.1.201:8080/rest/v1/resources \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check API Version**:
   ```javascript
   // Ensure using correct API version
   const API_BASE_PATH = '/rest/v1';
   ```

---

### 400 Bad Request

**Error**:
```
400 Bad Request
Invalid request payload
```

**Causes**:
1. Missing required fields
2. Invalid data type
3. Malformed JSON
4. Validation errors

**Debug**:

1. **Check Required Fields**:
   ```javascript
   // For resource creation:
   {
     "first_name": "required",
     "start_date": "required (YYYY-MM-DD)",
     "resource_type_id": "required (number)"
   }
   ```

2. **Validate Data Types**:
   ```javascript
   // Function node: Validate before sending
   const data = $json;
   
   // Check types
   if (typeof data.first_name !== 'string') {
     throw new Error('first_name must be a string');
   }
   
   if (typeof data.resource_type_id !== 'number') {
     throw new Error('resource_type_id must be a number');
   }
   
   // Check date format
   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
   if (!dateRegex.test(data.start_date)) {
     throw new Error('start_date must be in YYYY-MM-DD format');
   }
   
   return $input.all();
   ```

3. **Inspect Request Payload**:
   ```javascript
   // Function node before ERS App node
   console.log('Request payload:', JSON.stringify($json, null, 2));
   return $input.all();
   ```

---

### 401 Unauthorized

**Error**:
```
401 Unauthorized
Authentication required
```

**Solutions**:

1. **Check Credentials**:
   - Credentials selected in node
   - Credentials connected
   - Token not expired

2. **Re-authenticate**:
   - Go to Credentials
   - Click "Reconnect"
   - Complete OAuth2 flow

3. **Check Authorization Header**:
   ```bash
   # Should be:
   Authorization: Bearer {access_token}
   ```

---

### 403 Forbidden

**Error**:
```
403 Forbidden
Insufficient permissions
```

**Causes**:
1. Missing OAuth2 scopes
2. User doesn't have permission
3. Resource access restricted

**Solutions**:

1. **Check Scopes**:
   ```javascript
   // Current scopes:
   // - users:read
   // - users:write
   // - companies:read
   
   // If you need additional scopes, contact ERS App admin
   ```

2. **Verify User Permissions**:
   - Log into ERS App with same account
   - Try to perform the operation manually
   - If it works, OAuth2 scope issue
   - If it doesn't, user permission issue

3. **Request Additional Permissions**:
   - Contact ERS App administrator
   - Request required scopes/permissions

---

### 429 Too Many Requests

**Error**:
```
429 Too Many Requests
Rate limit exceeded
```

**Solutions**:

1. **Add Delays**:
   ```
   ┌─────────────────┐
   │  Loop Over Items│
   └────────┬────────┘
            │
            v
   ┌─────────────────┐
   │   Ers App Node  │
   └────────┬────────┘
            │
            v
   ┌─────────────────┐
   │   Wait Node     │
   │   1 second      │
   └─────────────────┘
   ```

2. **Batch Requests**:
   ```javascript
   // Use POST Many instead of multiple creates
   // Process items in batches
   ```

3. **Implement Retry Logic**:
   ```javascript
   // Function node
   async function retryRequest(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.statusCode === 429 && i < maxRetries - 1) {
           await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
           continue;
         }
         throw error;
       }
     }
   }
   ```

---

### 500 Internal Server Error

**Error**:
```
500 Internal Server Error
```

**Causes**:
1. ERS App API error
2. Invalid data causing server error
3. Server issue

**Debug**:

1. **Check ERS App Logs**:
   - Contact ERS App administrator
   - Request server logs for the timestamp
   - Identify the root cause

2. **Test with Different Data**:
   - Try with minimal valid data
   - Isolate problematic field

3. **Report to ERS App Team**:
   - Provide request details
   - Include payload
   - Include timestamp

---

## Performance Issues

### Slow Execution

**Symptoms**:
- Node takes long time to execute
- Workflow timeouts

**Causes**:
1. Large datasets
2. No pagination
3. Network latency
4. Complex transformations

**Solutions**:

1. **Use Pagination**:
   ```javascript
   // Set limit instead of "Return All"
   {
     "returnAll": false,
     "limit": 100
   }
   ```

2. **Batch Processing**:
   ```javascript
   // Process items in smaller batches
   // Use Split In Batches node
   ```

3. **Optimize Network**:
   - Use n8n closer to ERS App server
   - Check network latency:
     ```bash
     ping 192.168.1.201
     ```

4. **Simplify Transformations**:
   - Avoid complex computations in Function nodes
   - Use efficient algorithms
   - Cache frequently used data

---

### Memory Issues

**Error**:
```
JavaScript heap out of memory
```

**Solutions**:

1. **Increase Node.js Memory**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   n8n start
   ```

2. **Process in Batches**:
   ```
   ┌─────────────────────┐
   │  Split In Batches   │
   │  Batch Size: 100    │
   └──────────┬──────────┘
              │
              v
   ┌─────────────────────┐
   │  Process Batch      │
   └─────────────────────┘
   ```

3. **Reduce Data Size**:
   ```javascript
   // Function node: Remove unnecessary fields
   return {
     json: {
       id: $json.id,
       name: $json.first_name,
       // Include only needed fields
     }
   };
   ```

---

## Debugging Tools

### 1. n8n Debug Mode

```bash
# Enable debug logging
export N8N_LOG_LEVEL=debug
n8n start

# Or with specific modules
export N8N_LOG_LEVEL=debug
export DEBUG=n8n:*
n8n start
```

### 2. Browser Developer Tools

1. Open n8n in browser
2. Press F12 to open DevTools
3. Go to Network tab
4. Execute workflow
5. Inspect API requests/responses

### 3. Function Node Logging

```javascript
// Add at various points in workflow
console.log('Current data:', JSON.stringify($json, null, 2));
console.log('Input items count:', $input.all().length);
console.log('Current index:', $itemIndex);
console.log('Workflow static data:', this.getWorkflowStaticData('global'));

return $input.all();
```

### 4. Error Trigger Node

Create error handling workflow:

```
Main Workflow:
┌─────────────────┐
│  Main Process   │
│  (may fail)     │
└─────────────────┘

Error Workflow:
┌─────────────────┐
│  Error Trigger  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Log Error      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Send Alert     │
└─────────────────┘
```

### 5. n8n API for Debugging

```bash
# Get workflow executions
curl http://localhost:5678/rest/executions \
  -H "X-N8N-API-KEY: your-api-key"

# Get specific execution
curl http://localhost:5678/rest/executions/123 \
  -H "X-N8N-API-KEY: your-api-key"
```

### 6. Webhook Testing Tools

**Using curl**:
```bash
curl -X POST \
  http://localhost:5678/webhook/ersapp-webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "event": "create",
    "entity": "resource",
    "entity_id": 123,
    "data": {
      "id": 123,
      "first_name": "Test",
      "last_name": "User"
    }
  }'
```

**Using Postman**:
1. Create new request
2. Method: POST
3. URL: Your webhook URL
4. Headers: Content-Type: application/json
5. Body: JSON payload
6. Send

**Using webhook.site**:
1. Go to https://webhook.site
2. Get unique URL
3. Use as Webhook URL Override in testing
4. View incoming webhooks in real-time

---

## Getting Help

### Before Asking for Help

Gather this information:

1. **Environment**:
   - n8n version
   - Node.js version
   - Operating system
   - Installation method (npm, Docker, n8n Cloud)

2. **Error Details**:
   - Exact error message
   - Screenshot if possible
   - Steps to reproduce
   - When it started occurring

3. **Configuration**:
   - Node configuration (screenshot)
   - Workflow structure
   - n8n logs (relevant portions)

4. **What You've Tried**:
   - List troubleshooting steps taken
   - Results of each step

### Where to Get Help

1. **GitHub Issues**:
   - Repository: https://github.com/lavish-enbraun/ers-n8n
   - Search existing issues first
   - Create new issue with details above

2. **n8n Community Forum**:
   - https://community.n8n.io/
   - Tag: `community-nodes`, `ers-app`
   - Search before posting

3. **Email Support**:
   - lavish.pareta@enbraun.com
   - Include all information from "Before Asking for Help"

4. **ERS App Support**:
   - For ERS App API issues
   - For OAuth2 client configuration
   - For webhook registration issues on ERS side

### Creating a Good Issue Report

Template:

```markdown
## Description
Brief description of the issue

## Environment
- n8n version: 0.210.0
- Node.js version: 18.0.0
- OS: Ubuntu 22.04
- Installation: Docker

## Steps to Reproduce
1. Create new workflow
2. Add Ers App node
3. Configure with...
4. Execute node

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Message
```
Paste error message here
```

## Screenshots
[Attach screenshots]

## Logs
```
Paste relevant logs here
```

## What I've Tried
- Tried reconnecting credentials
- Restarted n8n
- Cleared cache
```

---

## Quick Reference

### Common Error Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 400 | Bad Request | Invalid data, missing fields |
| 401 | Unauthorized | Invalid/missing credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | ERS App API issue |

### Common Solutions Checklist

- [ ] Restart n8n
- [ ] Re-authenticate credentials
- [ ] Check workflow is active
- [ ] Verify input data format
- [ ] Check n8n logs
- [ ] Test webhook URL manually
- [ ] Verify network connectivity
- [ ] Check ERS App API status
- [ ] Update to latest version
- [ ] Clear browser cache

---

## Advanced Debugging

### Enable Verbose Logging

```bash
# Maximum logging
export N8N_LOG_LEVEL=verbose
export N8N_LOG_OUTPUT=console,file
export DEBUG=*
n8n start 2>&1 | tee n8n-debug.log
```

### Inspect Database

```bash
# If using SQLite
sqlite3 ~/.n8n/database.sqlite

# Query executions
SELECT * FROM execution_entity ORDER BY startedAt DESC LIMIT 10;

# Query credentials
SELECT id, name, type FROM credentials_entity;
```

### Network Debugging

```bash
# Capture network traffic
sudo tcpdump -i any -s 0 -w n8n-traffic.pcap port 5678

# Analyze with Wireshark
wireshark n8n-traffic.pcap
```

### Profile Performance

```javascript
// Function node
const start = Date.now();

// Your code here

const duration = Date.now() - start;
console.log(`Execution time: ${duration}ms`);

return $input.all();
```

---

**Last Updated**: November 28, 2025
