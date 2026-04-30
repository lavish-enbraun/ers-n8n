# n8n-nodes-ers

This is an n8n community node that enables integration with **eResource Scheduler (eRS)** inside your n8n workflows.

eResource Scheduler is a resource management platform used to manage resources, projects, bookings, timesheets, and requirements. This node allows you to automate workflows by connecting eRS with other systems using triggers, actions, and API-based communication.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

---

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Operations](#operations)
- [Credentials](#credentials)
- [Using the Node](#using-the-node)
- [Webhooks (How Triggers Work)](#webhooks-how-triggers-work)
- [Error Handling](#error-handling)
- [Resources](#resources)
- [Compatibility](#compatibility)
- [Version History](#version-history)
- [License](#license)

---

## Installation

Follow the official guide to install community nodes:  
https://docs.n8n.io/integrations/community-nodes/installation/

---

## Features

- Real-time automation using **webhooks**
- Support for multiple entities (Resource, Project, Booking, etc.)
- Trigger-based workflows (Create, Update, Delete)
- Full CRUD operations via actions
- Secure authentication using access tokens
- Dynamic field mapping using n8n expressions

---

## Operations

### 🔔 Triggers (Webhooks)

Triggers listen to real-time events from eResource Scheduler:

- **On Create**
- **On Update**
- **On Delete**

Supported entities:

- Resource
- Project
- Booking
- Timesheet
- Requirement

---

### ⚙️ Actions

Use action nodes to create, read, update, delete, and search eRS records from workflows.

Supported action entities:

- Resource
- Project
- Booking
- Timesheet
- Requirement

Supported operations by entity:

- **Resource:** Create, Update, Delete, Get One, Get Many, Search
- **Project:** Create, Update, Delete, Get One, Get Many, Search
- **Booking:** Create, Update, Delete, Get One, Get Many, Search
- **Timesheet:** Create, Update, Delete, Get One, Search
- **Requirement:** Create, Update, Delete, Get One, Get Many, Search

### Action Node Usage Pattern

1. Add **eResource Scheduler** (action) node
2. Select an **Entity**
3. Select an **Operation**
4. Provide required fields (IDs, dates, payload fields)
5. Optionally map values from previous nodes using expressions
6. Execute the node and use returned JSON in downstream steps

### Action Node Notes

- `Get Many` and `Search` are different:
  - `Get Many` uses list endpoints
  - `Search` uses eRS search endpoints with JSON filter bodies
- Returned records can be directly mapped into further n8n nodes
- Field availability depends on selected entity/operation and eRS configuration

---

## Credentials

To use this node, you must authenticate with eResource Scheduler (eRS) using an access token.

### Supported Authentication

- **OAuth Access Token**
- **User Access Token**

### Which Method Should You Choose?

- **User Access Token**
  - Best for quick setup and direct internal automations.
  - Generate from `Profile > Security` in eRS.
- **OAuth Access Token**
  - Best for third-party apps and delegated user authorization flows.
  - Requires application registration in eRS and OAuth code flow.

### Minimum Roles / Permissions

- **Action nodes (Resource, Project, Booking, Timesheet, Requirement):**
  - Token user must have entity-level permission for selected operation.
- **Trigger nodes (webhooks):**
  - Admin permissions are required to configure and use triggers.
- **OAuth app registration:**
  - Admin access is required to register OAuth applications.

### Setup

1. Generate an access token from eResource Scheduler:
   - User Token -> via User Profile > Security  
   - OAuth Token -> via OAuth Application (authorization code flow)  
2. In n8n:
   - Create new credentials  
   - Select authentication type  
   - Enter the token  
   - Save  

---

## Using the Node

### Basic Workflow

1. Create a new workflow in n8n  
2. Add **eResource Scheduler Trigger**  
3. Select:
   - Entity (e.g., Resource, Booking)  
   - Event (Create, Update, Delete)  
4. Execute the trigger (this registers a webhook in eRS)  
5. Add an **Action node**  
6. Map fields from trigger output  
7. Execute or activate the workflow  

### Quick Start (Action Node)

1. Add **eResource Scheduler** node to your workflow
2. Select **Resource** (Resource, Project, Booking, Timesheet, Requirement)
3. Select **Operation**
4. Configure required fields (IDs, dates, and payload fields)
5. Execute and pass returned JSON to downstream nodes

---

## Webhooks (How Triggers Work)

This node uses **eResource Scheduler Webhooks** for real-time automation.

### Flow

1. Trigger node is executed in n8n  
2. A webhook is registered in eRS  
3. eRS listens for selected events  
4. When an event occurs, eRS sends a **POST request** to n8n  
5. The workflow is triggered with event data  

---

### Supported Events

- Create  
- Update  
- Delete  

Across:

- Resource  
- Project  
- Booking  
- Timesheet  
- Requirement  

---

### Payload

- Format: **JSON**
- Includes:
  - Event type  
  - Entity type  
  - Record data (IDs, fields, timestamps)  
  - Custom/User-defined fields  

---

### Important Notes

- Webhooks only capture events **after activation**
- Each event triggers a **separate workflow execution**
- If workflow is not active, events may not process in real-time
- In inactive (non-published) workflows:
  - Events are processed **one at a time**
- Admin permissions are required to configure and use triggers (webhooks)

---

## Error Handling

Common errors include:

- Invalid or expired access token
- Missing mandatory fields
- Invalid entity/resource ID
- API or network failures

Errors are returned in the output section of the node.

---

## Resources

- n8n community nodes documentation:  
  https://docs.n8n.io/integrations/#community-nodes

- eResource Scheduler API documentation:  
  https://apidocs.eresourcescheduler.cloud/#introduction

- eResource Scheduler Webhook documentation:  
  https://support.eresourcescheduler.cloud/hc/en-us/articles/52953834001305-eRS-Webhook-Documentation

---

## Compatibility

- Recommended: Latest stable version of n8n
- Tested with: n8n v2.x+
- No known incompatibility issues

---

## Version History

### v0.1.0

- Initial release
- Webhook-based triggers (Create, Update, Delete)
- CRUD + Get Many/Search operations across supported entities (Timesheet supports Search and Get One, but not Get Many)

---

## License

[MIT](./LICENSE)
