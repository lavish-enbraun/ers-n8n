# Credentials Setup Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [OAuth2 Configuration](#oauth2-configuration)
- [Step-by-Step Setup](#step-by-step-setup)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)
- [Best Practices](#best-practices)

---

## Overview

The ERS App integration uses **OAuth2 authentication** with the **Authorization Code** grant type. This provides secure, token-based authentication without exposing passwords.

### Authentication Flow

```
┌─────────┐                                  ┌──────────┐
│   n8n   │                                  │ ERS App  │
└────┬────┘                                  └─────┬────┘
     │                                             │
     │ 1. Initiate OAuth2 Flow                    │
     ├────────────────────────────────────────────>│
     │                                             │
     │ 2. User Login & Authorization              │
     │                                             │
     │ 3. Authorization Code                      │
     │<────────────────────────────────────────────┤
     │                                             │
     │ 4. Exchange Code for Access Token          │
     ├────────────────────────────────────────────>│
     │                                             │
     │ 5. Access Token + Refresh Token            │
     │<────────────────────────────────────────────┤
     │                                             │
     │ 6. API Requests with Access Token          │
     ├────────────────────────────────────────────>│
     │                                             │
```

---

## Prerequisites

Before setting up credentials, ensure you have:

1. **ERS App Account**:
   - Valid user account with API access
   - Appropriate permissions for required operations
   - Admin access (for webhook management)

2. **OAuth2 Client Credentials**:
   - Client ID
   - Client Secret
   - Contact your ERS App administrator if you don't have these

3. **Network Access**:
   - n8n can reach ERS App API (`http://192.168.1.201:8080`)
   - ERS App can reach n8n (for OAuth2 callback)

4. **n8n Version**:
   - n8n v0.210.0 or higher
   - OAuth2 support enabled

---

## OAuth2 Configuration

### Default Configuration

The integration comes with pre-configured OAuth2 settings:

| Setting | Value |
|---------|-------|
| **Client ID** | `121` |
| **Client Secret** | `122` |
| **Grant Type** | Authorization Code |
| **Authorization URL** | `{BASE_URL}/login/oauth/authorize` |
| **Access Token URL** | `{BASE_URL}/login/oauth/token?client_source=system` |
| **Scope** | `users:read users:write companies:read` |
| **Authentication** | Header |

**Note**: The Client ID and Secret are hidden fields in the credential configuration. To change them, you'll need to modify the source code in `credentials/ErsAppOAuth2Api.credentials.ts`.

### OAuth2 URLs

**Base URL**: `http://192.168.1.201:8080` (configured in `nodes/ErsApp/constants.ts`)

**Full URLs**:
- **Authorization**: `http://192.168.1.201:8080/login/oauth/authorize?client_source=system`
- **Token**: `http://192.168.1.201:8080/login/oauth/token?client_source=system`
- **OAuth Redirect**: `http://localhost:5678/rest/oauth2-credential/callback`

### Scopes

The integration requests the following scopes:

| Scope | Description |
|-------|-------------|
| `users:read` | Read user information and profiles |
| `users:write` | Create and update users |
| `companies:read` | Read company/organization data |

**Note**: Adjust scopes based on your use case. Contact ERS App administrator for custom scopes.

---

## Step-by-Step Setup

### Step 1: Access n8n Credentials

1. Open n8n in your browser
2. Click on **"Credentials"** in the left sidebar
3. Click **"New Credential"** button

### Step 2: Search for ERS App Credential

1. In the search box, type: **"ERS App"** or **"OAuth2"**
2. Select **"ERS App OAuth2 API"** from the results
3. A new credential dialog will open

### Step 3: Review Credential Information

You'll see the following information:

- **Credential Name**: Give it a descriptive name (e.g., "ERS App Production")
- **Client ID**: Pre-configured (hidden)
- **Client Secret**: Pre-configured (hidden)
- **OAuth2 URLs**: Pre-configured (hidden)

### Step 4: Connect Your Account

1. Click **"Connect my account"** button
2. You'll be redirected to the ERS App authorization page
3. Log in with your ERS App credentials
4. Review the requested permissions
5. Click **"Authorize"** or **"Allow"**
6. You'll be redirected back to n8n

### Step 5: Verify Connection

1. After authorization, you should see:
   - ✅ **"Connected"** status
   - Your username or email
   - Token expiration time

2. Click **"Save"** to save the credential

### Step 6: Test the Credential

1. Create a new workflow
2. Add an **"Ers App"** node
3. Select your newly created credential
4. Choose **"Get Many"** operation
5. Click **"Execute Node"**
6. Verify data is returned successfully

---

## Troubleshooting

### Issue 1: OAuth2 Redirect URI Mismatch

**Error**:
```
The redirect URI provided does not match the configured value
```

**Cause**: n8n's OAuth2 callback URL doesn't match ERS App configuration

**Solutions**:

1. **Check n8n URL**:
   ```bash
   # Your n8n OAuth callback should be:
   http://your-n8n-instance:5678/rest/oauth2-credential/callback
   ```

2. **Configure in ERS App**:
   - Contact ERS App administrator
   - Register the callback URL in OAuth2 client settings
   - Ensure exact match (including protocol, port, path)

3. **Update n8n Base URL**:
   ```bash
   # Set environment variables
   export N8N_HOST=your-n8n-instance.com
   export N8N_PROTOCOL=https
   export N8N_PORT=5678
   
   # Restart n8n
   ```

---

### Issue 2: Authorization Failed

**Error**:
```
Authorization failed. Please try again.
```

**Causes & Solutions**:

1. **Invalid Credentials**:
   - Verify Client ID and Secret
   - Contact ERS App administrator for correct values

2. **Network Issues**:
   - Check ERS App server is accessible
   - Test connection:
     ```bash
     curl http://192.168.1.201:8080/login/oauth/authorize
     ```

3. **User Permissions**:
   - Verify your ERS App account has API access
   - Check required scopes are granted

4. **OAuth2 Client Disabled**:
   - Contact ERS App administrator
   - Verify OAuth2 client is active

---

### Issue 3: Token Expired

**Error**:
```
Access token expired
```

**Solution**:

OAuth2 tokens automatically refresh. If auto-refresh fails:

1. **Re-authenticate**:
   - Go to Credentials
   - Select your ERS App credential
   - Click **"Reconnect"**
   - Complete OAuth2 flow again

2. **Check Refresh Token**:
   - Verify refresh token is not expired
   - Check ERS App token lifetime settings

---

### Issue 4: Cannot Access Credential

**Error**:
```
OAuth2 access token not found in credentials
```

**Causes**:

1. **Credential Not Saved**: Click Save after connecting
2. **Credential Corrupted**: Delete and recreate
3. **n8n Version Issue**: Update to latest n8n version

**Solution**:

```javascript
// Debug: Check credential structure
console.log('Credential keys:', Object.keys(credentials));

// Expected keys:
// - access_token or accessToken
// - refresh_token
// - expires_in
// - token_type
```

---

### Issue 5: Scope Permission Denied

**Error**:
```
Insufficient permissions for requested operation
```

**Solution**:

1. **Re-authenticate with Correct Scopes**:
   - Delete existing credential
   - Create new credential
   - Ensure all scopes are granted during authorization

2. **Contact Administrator**:
   - Your account may need additional permissions
   - Request admin to grant required scopes

---

## Advanced Configuration

### Custom OAuth2 Client

If you need to use custom Client ID and Secret:

1. **Edit Credential File**:
   ```typescript
   // credentials/ErsAppOAuth2Api.credentials.ts
   
   properties: INodeProperties[] = [
       {
           displayName: 'Client ID',
           name: 'clientId',
           type: 'string', // Change from 'hidden' to 'string'
           default: '',
           required: true,
       },
       {
           displayName: 'Client Secret',
           name: 'clientSecret',
           type: 'string', // Change from 'hidden'
           typeOptions: {
               password: true,
           },
           required: true,
           default: '',
       },
       // ... rest of configuration
   ];
   ```

2. **Rebuild Package**:
   ```bash
   npm run build
   ```

3. **Restart n8n**:
   ```bash
   n8n start
   ```

4. **Create New Credential**:
   - Now you can enter custom Client ID and Secret

---

### Custom Base URL

To use a different ERS App instance:

1. **Edit Constants File**:
   ```typescript
   // nodes/ErsApp/constants.ts
   
   export const BASE_URL = 'http://your-ers-instance.com:8080';
   export const API_BASE_PATH = '/rest/v1';
   ```

2. **Rebuild and Restart**:
   ```bash
   npm run build
   n8n start
   ```

---

### Environment-Specific Credentials

Manage credentials for different environments:

**Development Credential**:
- Name: "ERS App - Dev"
- Base URL: `http://192.168.1.201:8080`
- Client ID: Development client

**Staging Credential**:
- Name: "ERS App - Staging"
- Base URL: `http://staging.ers-app.com`
- Client ID: Staging client

**Production Credential**:
- Name: "ERS App - Production"
- Base URL: `https://ers-app.com`
- Client ID: Production client

**Workflow Configuration**:

Use different credentials based on environment variable:

```javascript
// Function node: Select credential based on environment
const env = $env.ENVIRONMENT || 'production';

// Configure node credential programmatically
// Note: This is pseudo-code, actual implementation may vary
const credentialName = `ERS App - ${env.charAt(0).toUpperCase() + env.slice(1)}`;
```

---

### Multiple OAuth2 Accounts

You can create multiple credentials for different ERS App accounts:

1. **Create First Credential**:
   - Name: "ERS App - Account A"
   - Connect with Account A credentials

2. **Create Second Credential**:
   - Name: "ERS App - Account B"
   - Connect with Account B credentials

3. **Use in Workflows**:
   - Select appropriate credential per node
   - Useful for cross-account operations

---

## Best Practices

### 1. Credential Naming Convention

Use clear, descriptive names:

```
✅ Good:
- "ERS App - Production - Admin"
- "ERS App - Dev - Test User"
- "ERS App - Staging - Integration"

❌ Bad:
- "ERS"
- "Credential 1"
- "My Credential"
```

### 2. Credential Security

**Do**:
- ✅ Use OAuth2 (never API keys or passwords)
- ✅ Limit scopes to minimum required
- ✅ Rotate credentials periodically
- ✅ Use separate credentials per environment
- ✅ Restrict access to credential management

**Don't**:
- ❌ Share credentials across teams
- ❌ Hardcode credentials in workflows
- ❌ Grant unnecessary scopes
- ❌ Use production credentials in development
- ❌ Commit credentials to version control

### 3. Token Management

**Access Tokens**:
- Automatically refresh (handled by n8n)
- Short-lived (typically 1 hour)
- Stored encrypted by n8n

**Refresh Tokens**:
- Long-lived (typically 30-90 days)
- Used to obtain new access tokens
- Invalidate when:
  - User changes password
  - User revokes access
  - Admin disables OAuth2 client

### 4. Monitoring

**Set Up Alerts**:

```javascript
// Schedule Trigger (daily) - Check credential health

// Try to use credential
try {
  const result = await $http.request({
    method: 'GET',
    url: 'http://192.168.1.201:8080/rest/v1/resources',
    headers: {
      Authorization: 'Bearer ' + $credentials.accessToken
    },
    qs: { limit: 1 }
  });
  
  // Credential OK
  return [{
    json: {
      status: 'OK',
      timestamp: new Date().toISOString()
    }
  }];
} catch (error) {
  // Credential issue - send alert
  return [{
    json: {
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }];
}
```

### 5. Documentation

Document your credentials:

```markdown
# Credential Inventory

## Production
- **Name**: ERS App - Production
- **Scopes**: users:read, users:write, companies:read
- **Owner**: admin@company.com
- **Created**: 2024-01-10
- **Last Rotated**: 2024-01-10
- **Used By**: 
  - Workflow: Resource Sync
  - Workflow: Onboarding Automation

## Development
- **Name**: ERS App - Dev
- **Scopes**: users:read, users:write
- **Owner**: dev@company.com
- **Created**: 2024-01-10
- **Used By**:
  - Workflow: Test Workflows
```

---

## Credential Lifecycle

### Creation

```
1. Plan scope requirements
   ↓
2. Request OAuth2 client from ERS App admin
   ↓
3. Configure credential in n8n
   ↓
4. Complete OAuth2 authorization
   ↓
5. Test credential
   ↓
6. Document in credential inventory
```

### Rotation

**When to Rotate**:
- Every 90 days (recommended)
- After security incident
- When team member with access leaves
- After major ERS App updates

**How to Rotate**:

```
1. Create new OAuth2 client in ERS App
   ↓
2. Create new credential in n8n
   ↓
3. Test new credential
   ↓
4. Update all workflows to use new credential
   ↓
5. Test all workflows
   ↓
6. Disable old OAuth2 client
   ↓
7. Delete old credential from n8n
```

### Revocation

**When to Revoke**:
- Credential compromise
- No longer needed
- User account deactivated

**How to Revoke**:

```
1. Disable OAuth2 client in ERS App
   ↓
2. Delete credential from n8n
   ↓
3. Verify workflows fail gracefully
   ↓
4. Update workflows with new credential if needed
```

---

## OAuth2 Scopes Reference

### Standard Scopes

| Scope | Permissions | Required For |
|-------|-------------|--------------|
| `users:read` | View user profiles, resources | Get Many, Read operations |
| `users:write` | Create, update users | Create, Update operations |
| `companies:read` | View company data | Company-related queries |
| `companies:write` | Modify company data | Company-related updates |
| `projects:read` | View projects | Project operations |
| `projects:write` | Create, update projects | Project CRUD |
| `bookings:read` | View bookings | Booking queries |
| `bookings:write` | Create, update bookings | Booking CRUD |
| `webhooks:manage` | Register, manage webhooks | Webhook triggers |

### Requesting Additional Scopes

Contact your ERS App administrator:

```markdown
Subject: OAuth2 Scope Request for n8n Integration

Hi [Admin Name],

I need additional OAuth2 scopes for our n8n ERS App integration:

Current Scopes:
- users:read
- users:write
- companies:read

Requested Additional Scopes:
- projects:read (Reason: Need to query project data)
- bookings:read (Reason: Need to sync booking information)

Use Case: [Describe your use case]

Client ID: 121
Environment: Production

Thank you!
```

---

## Debugging OAuth2 Issues

### Enable Debug Logging

```bash
# Set environment variables
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=console,file

# Restart n8n
n8n start
```

### Check OAuth2 Flow

```bash
# Watch n8n logs
tail -f ~/.n8n/logs/n8n.log | grep -i oauth

# Look for:
# - Authorization request
# - Authorization code received
# - Token exchange request
# - Access token received
```

### Inspect Token

```javascript
// Function node: Inspect access token
const credentials = await this.getCredentials('ersAppOAuth2Api');

console.log('Credential structure:', Object.keys(credentials));
console.log('Has access_token:', 'access_token' in credentials);
console.log('Has refresh_token:', 'refresh_token' in credentials);

// Don't log actual tokens in production!
if (credentials.access_token) {
  console.log('Token prefix:', credentials.access_token.substring(0, 20));
}

return $input.all();
```

### Test API Request

```bash
# Manual OAuth2 test
# 1. Get access token from n8n credential (inspect in browser dev tools)
# 2. Test API request

curl -X GET \
  http://192.168.1.201:8080/rest/v1/resources?limit=1 \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Accept: application/json'
```

---

## Security Considerations

### 1. Token Storage

n8n stores credentials encrypted:
- **Encryption**: AES-256-CBC
- **Key**: Derived from `N8N_ENCRYPTION_KEY` environment variable
- **Storage**: SQLite, PostgreSQL, or MySQL database

**Secure Your Encryption Key**:

```bash
# Generate strong encryption key
export N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Store securely (use secrets manager in production)
echo "N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY" >> /etc/n8n/.env
chmod 600 /etc/n8n/.env
```

### 2. Network Security

**Use HTTPS**:
```bash
export N8N_PROTOCOL=https
export N8N_SSL_KEY=/path/to/key.pem
export N8N_SSL_CERT=/path/to/cert.pem
```

**Firewall Rules**:
```bash
# Allow only ERS App server
iptables -A INPUT -p tcp --dport 5678 -s 192.168.1.201 -j ACCEPT
iptables -A INPUT -p tcp --dport 5678 -j DROP
```

### 3. Access Control

**n8n User Permissions**:
- Limit who can create/edit credentials
- Use n8n's user management (n8n Cloud or self-hosted with auth)
- Separate credentials per user/team

---

## FAQs

**Q: Can I use API keys instead of OAuth2?**

A: No, the ERS App integration only supports OAuth2 authentication. This is more secure than API keys.

**Q: How long do access tokens last?**

A: Typically 1 hour. n8n automatically refreshes them using the refresh token.

**Q: What happens if my refresh token expires?**

A: You'll need to re-authenticate by clicking "Reconnect" in the credential settings.

**Q: Can I share credentials between workflows?**

A: Yes! Create a credential once and use it in multiple workflows.

**Q: Can I export credentials?**

A: No, for security reasons n8n doesn't allow exporting encrypted credentials. You need to recreate them in the target environment.

**Q: How do I change the Client ID/Secret?**

A: Edit the credential source file as described in [Custom OAuth2 Client](#custom-oauth2-client).

---

## Further Resources

- [API Documentation](./API.md)
- [Usage Guide](./USAGE.md)
- [Webhook Guide](./WEBHOOKS.md)
- [n8n OAuth2 Documentation](https://docs.n8n.io/integrations/builtin/credentials/oauth2/)
- [OAuth2 RFC](https://datatracker.ietf.org/doc/html/rfc6749)

---

**Last Updated**: November 28, 2025
