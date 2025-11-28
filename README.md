# n8n-ers-app

An n8n community node to integrate with eResource Scheduler (ERS) App. This integration provides resource management, webhook triggers, and OAuth2 authentication for seamless workflow automation.

## 📚 Documentation

- **[API Documentation](./docs/API.md)** - Complete API reference for all nodes, operations, and data types
- **[Usage Guide](./docs/USAGE.md)** - Step-by-step tutorials and workflow examples
- **[Webhooks Guide](./docs/WEBHOOKS.md)** - Comprehensive webhook setup and configuration
- **[Credentials Setup](./docs/CREDENTIALS.md)** - OAuth2 authentication and credential management
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
- [Installation](#installation)
- [Credentials](#credentials)
- [Development](#development)
- [Version History](#version-history)

## Features

✨ **Resource Management**
- Create, read, and manage resources
- Batch operations support
- Pagination for large datasets

🔔 **Webhook Triggers**
- Real-time event notifications
- Automatic webhook registration
- Entity and event filtering
- Challenge verification support

🔐 **OAuth2 Authentication**
- Secure token-based authentication
- Automatic token refresh
- Multiple credential support

🚀 **Production Ready**
- Comprehensive error handling
- Detailed logging and debugging
- TypeScript support
- Full documentation

## Quick Start

### 1. Install the Package

```bash
npm install n8n-nodes-ers-app
```

### 2. Configure Credentials

1. Go to **Credentials** in n8n
2. Click **New Credential**
3. Search for "ERS App OAuth2 API"
4. Click **Connect my account**
5. Complete OAuth2 authorization

### 3. Create Your First Workflow

1. Add an **"Ers App"** node
2. Select your credentials
3. Choose **"Get Many"** operation
4. Execute to fetch resources

📖 For detailed instructions, see the [Usage Guide](./docs/USAGE.md)

## Prerequisites

Before setting up the local development environment, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **n8n** (for testing the node locally)
- **Git** (for cloning the repository)
- **ERS App Access** (OAuth2 credentials and API access)

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/lavish-enbraun/ers-n8n.git
cd ers-n8n
```

### Step 2: Install Dependencies

```bash
sudo npm install
```

This will install all required dependencies including:
- `@n8n/node-cli` - n8n node development tools
- `typescript` - TypeScript compiler
- `eslint` - Code linting
- Other development dependencies

### Step 3: Build the Node

Build the TypeScript source files to JavaScript:

```bash
sudo npm run build
```

This compiles the TypeScript files in `nodes/` and `credentials/` directories to the `dist/` directory.

### Step 4: Set Up n8n for Local Development

#### Option A: Using n8n CLI (Recommended)

1. **Install n8n globally** (if not already installed):
   ```bash
   sudo npm install -g n8n
   ```

2. **Set the N8N_CUSTOM_EXTENSIONS environment variable** to point to your local node:
   ```bash
   export N8N_CUSTOM_EXTENSIONS=/home/enbraun/Documents/source/ers-n8n
   ```

   Or on Windows:
   ```cmd
   set N8N_CUSTOM_EXTENSIONS=C:\path\to\ers-n8n
   ```

3. **Start n8n**:
   ```bash
   n8n start
   ```

4. **Access n8n** at `http://localhost:5678`

#### Option B: Using npx (No Global Installation)

1. **Set the N8N_CUSTOM_EXTENSIONS environment variable**:
   ```bash
   export N8N_CUSTOM_EXTENSIONS=/home/enbraun/Documents/source/ers-n8n
   ```

2. **Start n8n using npx**:
   ```bash
   npx n8n start
   ```

#### Option C: Using Docker

1. **Build the node** (if not already done):
   ```bash
   npm run build
   ```

2. **Run n8n with Docker** and mount your local node directory:
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     -v /home/enbraun/Documents/source/ers-n8n:/home/node/.n8n/custom \
     -e N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom \
     n8nio/n8n
   ```

### Step 5: Verify the Node is Loaded

1. Open n8n in your browser at `http://localhost:5678`
2. Create a new workflow
3. Click the "+" button to add a node
4. Search for "eResource Scheduler" or "ersApp"
5. You should see the **eResource Scheduler** node and **ERS App Trigger** node available

### Development Workflow

#### Watch Mode (Auto-rebuild on changes)

For active development, use watch mode to automatically rebuild when you make changes:

```bash
npm run build:watch
```

This will watch for file changes and automatically recompile TypeScript files.

#### Using n8n Dev Mode

Alternatively, you can use n8n's built-in development mode:

```bash
npm run dev
```

This command will:
- Watch for changes in your node files
- Automatically rebuild when changes are detected
- Reload n8n with the updated node

**Note:** Make sure n8n is running in a separate terminal when using `npm run dev`.

#### Linting

Check for code quality issues:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

## Installation

For production use, follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Installation Steps

1. **Install the package**:
   ```bash
   npm install n8n-nodes-ers-app
   ```

2. **Configure n8n** to use community nodes by setting:
   ```
   N8N_COMMUNITY_PACKAGES_ENABLED=true
   ```

3. **Restart n8n** and the node will be available in your workflows.

## Credentials

This node uses OAuth2 authentication. To set up credentials:

 **In n8n**:
   - Go to **Credentials** → **New**
   - Search for "ERS App OAuth2 API"
   - Enter your OAuth2 credentials
   - Click **Connect my account** to authorize
   - Save the credentials

**Use the credentials** in your eResource Scheduler nodes by selecting them from the credentials dropdown.

For more information on setting up webhooks, refer to the [Webhook API Documentation](./WEBHOOK_API.md).

## Nodes Overview

### ERS App Node

Main node for resource operations.

**Operations**:
- **Get Many**: Fetch multiple resources with pagination
- **Create**: Create a new resource
- **POST Many**: Bulk create resources

**Configuration**:
```json
{
  "resource": "resource",
  "operation": "getAll",
  "returnAll": true
}
```

📖 [Complete API Reference](./docs/API.md)

### ERS App Trigger (Basic)

Simple webhook endpoint for manual configuration.

**Use When**:
- Manual webhook setup preferred
- Simple use cases
- Testing webhook payloads

### ERS App Webhook Trigger (Advanced)

Advanced webhook with automatic registration and event filtering.

**Features**:
- ✅ Automatic webhook registration
- ✅ Entity and event filtering
- ✅ URL override for local development
- ✅ Lifecycle management

**Configuration**:
```json
{
  "entities": [1, 2],      // Resource, Project
  "events": [1, 2],        // Create, Update
  "webhookUrlOverride": "" // Optional for ngrok
}
```

📖 [Webhook Complete Guide](./docs/WEBHOOKS.md)

## Development

### Project Structure

```
ers-n8n/
├── credentials/          # OAuth2 credential configuration
│   └── ErsAppOAuth2Api.credentials.ts
├── nodes/                # Node implementations
│   └── ErsApp/
│       ├── ErsApp.node.ts                  # Main node
│       ├── ErsAppTrigger.node.ts           # Basic webhook trigger
│       ├── ErsAppWebhookTrigger.node.ts    # Advanced webhook trigger
│       ├── constants.ts                     # API constants
│       └── resources/                       # Resource operations
│           └── resource/
│               ├── index.ts
│               ├── create.ts
│               ├── getAll.ts
│               └── postMany.ts
├── docs/                 # Documentation
│   ├── API.md
│   ├── USAGE.md
│   ├── WEBHOOKS.md
│   ├── CREDENTIALS.md
│   └── TROUBLESHOOTING.md
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Building for Production

```bash
npm run build
```

This creates optimized JavaScript files in the `dist/` directory.

### Start the server

```bash
n8n start
```

## Use Cases

### 🎯 Resource Onboarding
Automatically create user accounts and send welcome emails when resources are added to ERS App.

### 📊 Utilization Tracking
Monitor resource allocation and generate reports on project utilization.

### 🔄 CRM Synchronization
Two-way sync between ERS App and external CRM systems (HubSpot, Salesforce, etc.).

### 📧 Notification System
Send notifications via email, Slack, or Teams when resources are created, updated, or deleted.

### 📈 Analytics & Reporting
Extract resource data, transform it, and push to analytics platforms.

📖 See more examples in the [Usage Guide](./docs/USAGE.md)

## Version History

### 0.1.0 (Current)
- ✅ Initial release
- ✅ Resource operations (Get Many, Create, POST Many)
- ✅ OAuth2 authentication
- ✅ Basic webhook trigger (ErsAppTrigger)
- ✅ Advanced webhook trigger (ErsAppWebhookTrigger)
- ✅ Automatic webhook registration and management
- ✅ Entity and event filtering
- ✅ Comprehensive documentation
- ✅ TypeScript support
- ✅ Error handling and logging

**Known Limitations**:
- Only Resource entity operations implemented
- No Update or Delete operations yet
- Unsigned webhooks only

---

## Troubleshooting

### Quick Fixes

| Issue | Solution |
|-------|----------|
| Node not appearing | Rebuild (`npm run build`) and restart n8n |
| Authentication failed | Re-authenticate credentials in n8n |
| Webhook not triggering | Check workflow is active and n8n is accessible |
| 401 Unauthorized | Token expired, reconnect credentials |
| 404 Not Found | Verify BASE_URL in constants.ts |

📖 For complete troubleshooting guide, see [Troubleshooting Documentation](./docs/TROUBLESHOOTING.md)

## Support & Contributing

### Getting Help

- 📖 [Documentation](./docs/)
- 💬 [GitHub Issues](https://github.com/lavish-enbraun/ers-n8n/issues)
- 📧 Email: lavish.pareta@enbraun.com
- 🌐 [n8n Community Forum](https://community.n8n.io/)

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Reporting Issues

When reporting issues, please include:

- n8n version
- Node.js version
- Error messages
- Steps to reproduce
- Expected vs actual behavior

---

**Author:** lavish (lavish.pareta@enbraun.com)  
**License:** MIT
