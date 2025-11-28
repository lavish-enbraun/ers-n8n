# n8n-ers-app

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Installation](#installation)
- [Credentials](#credentials)
- [Development](#development)
- [Version History](#version-history)

## Prerequisites

Before setting up the local development environment, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **n8n** (for testing the node locally)
- **Git** (for cloning the repository)

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

## Development

### Project Structure

```
ers-n8n/
├── credentials/          # OAuth2 credential configuration
│   └── ErsAppOAuth2Api.credentials.ts
├── nodes/                # Node implementations
│   └── ErsApp/
│       ├── ErsApp.node.ts           # Main node
│       ├── ErsAppTrigger.node.ts    # Webhook trigger node
│       ├── constants.ts              # API constants
│       └── resources/                # Resource-specific operations
│           ├── booking/
│           ├── exception/
│           ├── project/
│           ├── requirement/
│           └── resource/
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

## Version History

### 0.1.0
- Initial release
- Support for Resource, Project, Booking, Requirement, and Exception entities
- CRUD operations for all entity types
- OAuth2 authentication
- Webhook trigger node
- Basic error handling and validation

---

## Troubleshooting

### Node Not Appearing in n8n

1. **Check the build**: Ensure `npm run build` completed successfully
2. **Verify N8N_CUSTOM_EXTENSIONS**: Make sure the environment variable points to the correct directory
3. **Check n8n logs**: Look for any error messages about loading custom nodes
4. **Restart n8n**: Sometimes n8n needs a restart to detect new nodes

### Build Errors

1. **TypeScript errors**: Run `npm run lint` to see detailed error messages
2. **Missing dependencies**: Run `npm install` again
3. **Type issues**: Check that all imports are correct and types are properly defined

### Authentication Issues

1. **Verify credentials**: Double-check OAuth2 credentials in n8n
2. **Check API base URL**: Ensure the BASE_URL in `constants.ts` is correct
3. **Token expiration**: Re-authenticate if tokens have expired

---

**Author:** lavish (lavish.pareta@enbraun.com)  
**License:** MIT
