# n8n-ers-app

n8n community node for the **eResource Scheduler (ERS App)** API, allowing you to manage resources, projects, bookings, requirements, and timesheets directly from your n8n workflows.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-ers-app.svg)](https://www.npmjs.com/package/n8n-nodes-ers-app)
[![license](https://img.shields.io/npm/l/n8n-nodes-ers-app.svg)](https://github.com/lavish-enbraun/ers-n8n/blob/main/LICENSE)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Credentials](#credentials)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Version History](#version-history)
- [Author & License](#author--license)

## Features

- **ERS App integration**: Connect n8n to your eResource Scheduler (ERS App) instance.
- **Entity coverage**: Work with **Resource**, **Project**, **Booking**, **Requirement**, and **Timesheet** entities.
- **CRUD operations**: Create, read, update, and delete supported entities via the ERS App API.
- **Trigger support**: Use the **ERS App Trigger** node to react to webhook events from ERS App.
- **OAuth2 authentication**: Securely authorize access to your ERS App tenant using OAuth2 or access tokens.

## Installation

You can install this package either through n8n’s Community Nodes UI or by using npm.

### 1. Enable community nodes in n8n

Make sure community packages are enabled in your n8n instance:

```bash
export N8N_COMMUNITY_PACKAGES_ENABLED=true
```

Restart n8n after changing this setting.

### 2. Install the package

#### Option A: From n8n UI (recommended)

1. Open n8n.
2. Go to **Settings → Community Nodes**.
3. Add a new community package: `n8n-nodes-ers-app`.
4. Confirm and restart n8n if prompted.

#### Option B: Using npm

If you manage n8n as a project with a `package.json`, you can install the package directly:

```bash
npm install n8n-nodes-ers-app
```

For more details, see the official n8n community nodes installation guide:

> [Community Nodes Installation Guide](https://docs.n8n.io/integrations/community-nodes/installation/)

After installation and restart, search for **“eResource Scheduler”** or **“ERS App”** when adding a node in your workflows.

For more information on setting up webhooks, refer to the [Webhook API Documentation](./WEBHOOK_API.md).

Once installed and n8n has restarted:

1. Open or create a workflow in n8n.
2. Click **“+”** to add a node.
3. Search for **“eResource Scheduler”** or **“ERS App”**.
4. Select either:
   - **eResource Scheduler** (regular node for API operations), or
   - **ERS App Trigger** (webhook-based trigger node).
5. Attach appropriate credentials (see [Credentials](#credentials)).
6. Choose the **Resource** (e.g. Project, Booking, Requirement, Resource, Timesheet) and **Operation** (e.g. Get, Get All, Create, Update, Delete) you want to perform.

Typical use cases:

- Syncing ERS resources or projects into another system.
- Creating or updating bookings when events happen in other apps.
- Reacting to ERS webhook events via the **ERS App Trigger** node and orchestrating downstream workflows.

For details on webhook payloads and ERS-specific behavior, refer to the [Webhook API Documentation](./WEBHOOK_API.md).

## Credentials

This package ships multiple credential types so you can authenticate in different ways to ERS App.

In n8n:

1. Go to **Credentials → New**.
2. Search for one of the following:
   - **ERS OAuth2**
   - **ERS Access Token**
3. Select the credential type that matches how your ERS App tenant is configured.

### Common fields

While exact fields depend on the credential type, you will typically need:

- **Base URL**: The base URL of your ERS App instance (e.g. `https://your-tenant.ersapp.com`).
- **Client ID** and **Client Secret**: OAuth2 client credentials obtained from ERS App / your administrator.
- **Authorization URL** and **Token URL**: OAuth2 endpoints for ERS App (often prefilled).
- **Redirect URL**: The callback URL n8n uses for OAuth2 flows (displayed in the credential UI).
- **Scopes / Permissions**: Optional scopes, if required by your ERS App configuration.
- **Access Token** (for Access Token credentials): A long-lived or refreshable token from ERS App.

### Creating and using credentials

1. Fill in the required fields for your chosen credential type.
2. Click **“Connect my account”** (for OAuth2 credentials) and complete the authorization in the browser.
3. Save the credential.
4. In your **eResource Scheduler** or **ERS App Trigger** nodes, pick the saved credential from the **Credentials** dropdown.

For webhook-specific setup (especially for **ERS App Trigger**), see the dedicated [Webhook API Documentation](./WEBHOOK_API.md) in this repository.

## Examples

Below are high-level examples to help you get started quickly.

### Example 1: Fetch all resources and log them

**Goal:** Retrieve all resources from ERS App and inspect the data.

1. Create a new workflow.
2. Add a **Manual Trigger** node.
3. Add an **eResource Scheduler** node:
   - **Resource**: `Resource`
   - **Operation**: `Get All`
   - **Credentials**: Select your `ERS OAuth2` (or `ERS Access Token`) credentials.
4. Optionally add a **Set** or **Code** node after it to transform or log the data.
5. Execute the workflow manually; you should see a list of resources returned from ERS App.

### Example 2: React to an ERS webhook and create a booking

**Goal:** When ERS App sends a webhook event, create or update a booking.

1. Create a new workflow.
2. Add an **ERS App Trigger** node:
   - Configure it following [Webhook API Documentation](./WEBHOOK_API.md) so ERS App sends events to n8n.
   - Attach your ERS credentials.
3. Add an **eResource Scheduler** node after the trigger:
   - **Resource**: `Booking`
   - **Operation**: `Create` (or `Update`).
   - Map fields from the trigger’s incoming JSON to the booking fields.
4. Optionally add other nodes (e.g. notifications, external system updates).
5. Activate the workflow so it listens for real ERS webhook events.

## Troubleshooting

### Node not appearing in n8n

1. **Check community nodes setting**: Ensure `N8N_COMMUNITY_PACKAGES_ENABLED=true` is set.
2. **Check installation**: Confirm that `n8n-nodes-ers-app` is installed (via UI or `npm install`).
3. **Restart n8n**: A restart is often required after installing or updating community nodes.
4. **Check logs**: Look at n8n logs for errors when loading community packages.

### Build / TypeScript errors (for local development)

1. **TypeScript errors**: Run `npm run lint` to see detailed diagnostics.
2. **Missing dependencies**: Run `npm install` again in the project directory.
3. **Type issues**: Check that all imports are correct and types are properly defined.

### Authentication issues

1. **Verify credentials**: Double‑check your OAuth2 or access‑token credentials in n8n.
2. **Check API base URL**: Ensure the base URL in credentials or `constants.ts` is correct for your ERS App tenant.
3. **Token expiration**: Re‑authenticate if tokens have expired or been revoked.

For more in‑depth, ERS‑specific webhook configuration, see [Webhook API Documentation](./WEBHOOK_API.md).

## Development

This section is for contributors or anyone developing the node locally.

### Prerequisites

Before setting up the local development environment, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **n8n** (for testing the node locally)
- **Git** (for cloning the repository)

### Local development setup

#### Step 1: Clone the repository

```bash
git clone https://github.com/lavish-enbraun/ers-n8n.git
cd ers-n8n
```

#### Step 2: Install dependencies

```bash
npm install
```

This will install all required dependencies including:

- `@n8n/node-cli` – n8n node development tools
- `typescript` – TypeScript compiler
- `eslint` – Code linting
- Other development dependencies

#### Step 3: Build the node

Build the TypeScript source files to JavaScript:

```bash
npm run build
```

This compiles the TypeScript files in `nodes/` and `credentials/` directories to the `dist/` directory.

#### Step 4: Set up n8n for local development

##### Option A: Using n8n CLI (recommended)

1. Install n8n globally (if not already installed):
   ```bash
   npm install -g n8n
   ```
2. Set the `N8N_CUSTOM_EXTENSIONS` environment variable to point to your local node:
   ```bash
   export N8N_CUSTOM_EXTENSIONS=/home/enbraun/Documents/source/ers-n8n
   ```
3. Start n8n:
   ```bash
   n8n start
   ```
4. Access n8n at `http://localhost:5678`.

##### Option B: Using `npx` (no global installation)

1. Set the `N8N_CUSTOM_EXTENSIONS` environment variable:
   ```bash
   export N8N_CUSTOM_EXTENSIONS=/home/enbraun/Documents/source/ers-n8n
   ```
2. Start n8n using `npx`:
   ```bash
   npx n8n start
   ```

##### Option C: Using Docker

1. Build the node (if not already done):
   ```bash
   npm run build
   ```
2. Run n8n with Docker and mount your local node directory:
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     -v /home/enbraun/Documents/source/ers-n8n:/home/node/.n8n/custom \
     -e N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom \
     n8nio/n8n
   ```

#### Verify the node is loaded (local)

1. Open n8n in your browser at `http://localhost:5678`.
2. Create a new workflow.
3. Click the **“+”** button to add a node.
4. Search for **“eResource Scheduler”** or **“ERS App”**.
5. You should see the **eResource Scheduler** node and **ERS App Trigger** node available.

### Development workflow

#### Watch mode (auto‑rebuild on changes)

For active development, use watch mode to automatically rebuild when you make changes:

```bash
npm run build:watch
```

This will watch for file changes and automatically recompile TypeScript files.

#### Using n8n dev mode

Alternatively, you can use n8n’s built‑in development mode:

```bash
npm run dev
```

This command will:

- Watch for changes in your node files.
- Automatically rebuild when changes are detected.
- Reload n8n with the updated node.

Make sure n8n is running in a separate terminal when using `npm run dev`.

### Linting

Check for code quality issues:

```bash
npm run lint
```

Auto‑fix linting issues:

```bash
npm run lint:fix
```

### Project structure

```text
ers-n8n/
├── credentials/                     # OAuth2 and access token credential definitions
│   ├── ErsAppOAuth2Api.credentials.ts
│   └── ErsAppAccessTokenApi.credentials.ts
├── nodes/                           # Node implementations
│   └── ErsApp/
│       ├── ErsApp.node.ts           # Main node (regular operations)
│       ├── ErsAppTrigger.node.ts    # Webhook trigger node
│       ├── ersApp.svg               # Node icon (light)
│       ├── ersApp.dark.svg          # Node icon (dark)
│       ├── constants.ts             # API and workflow constants
│       └── resources/               # Entity-specific operations/parameters
│           ├── booking/
│           ├── project/
│           ├── requirement/
│           ├── resource/
│           └── timesheet/
├── dist/                            # Compiled JavaScript (output for publishing)
├── package.json
├── tsconfig.json
└── README.md
```

### Building for production

```bash
npm run build
```

This creates optimized JavaScript files in the `dist/` directory.

### Release & publishing

Use the existing scripts in `package.json` to prepare and publish releases.

1. **Pre‑publish checks**
   - Lint the code:
     ```bash
     npm run lint
     ```
   - Build the project:
     ```bash
     npm run build
     ```
   - Run the n8n node CLI prerelease checks:
     ```bash
     npm run prepublishOnly
     # or
     npx n8n-node prerelease
     ```

2. **Create a release**
   - Use the release script (powered by `release-it` / `n8n-node release`) to bump the version and create a tag:
     ```bash
     npm run release
     ```

3. **Publish to npm**
   - After the release is prepared and tests pass, publish the package:
     ```bash
     npm publish
     ```

4. **Update version history**
   - For each new published version, add an entry to [Version History](#version-history) following semantic versioning.

## Version History

### 0.1.0

- Initial release.
- Support for Resource, Project, Booking, Requirement, and Timesheet entities.
- CRUD operations for all entity types.
- OAuth2 authentication.
- Webhook trigger node.
- Basic error handling and validation.

## Author & License

- **Author:** lavish (`lavish.pareta@enbraun.com`)
- **License:** MIT

