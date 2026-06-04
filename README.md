# n8n-nodes-ers-app

This is an n8n community node that enables integration with **eResource Scheduler (eRS)** inside your n8n workflows.

eResource Scheduler is a resource management and scheduling software that provides real-time visibility into resource availability, workloads, and capacity across projects. It helps organizations schedule the right talent, track utilization, manage timesheets, generate management reports, and forecast project financials from a single interface.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

---

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Operations](#operations)
- [Credentials](#credentials)
- [Webhooks (How Triggers Work)](#webhooks-how-triggers-work)
- [Resources](#resources)
- [Compatibility](#compatibility)
- [License](#license)

---

## Installation

Follow the official guide to install community nodes:  
[https://docs.n8n.io/integrations/community-nodes/installation/](https://docs.n8n.io/integrations/community-nodes/installation/)

---

## Features

- Real-time automation using **webhooks**
- Support for multiple entities (Resource, Project, Booking, etc.)
- Trigger-based workflows (Create, Update, Delete)
- Full CRUD operations via actions
- Secure authentication
- Dynamic field mapping using n8n expressions

---

## Operations

This node supports the following operations across different eResource Scheduler entities.

### eRS Trigger Node

Automatically start a workflow when an entity is created, updated, or deleted in eResource Scheduler.

Supported entities: Resource, Project, Booking, Timesheet, and Requirement.

- **Create:** Fires a workflow when a selected entity is created in eResource Scheduler.
- **Update:** Fires a workflow when a selected entity is updated in eResource Scheduler.
- **Delete:** Fires a workflow when a selected entity is deleted in eResource Scheduler.

### eRS Action Node

Perform create, read, update, delete, and search operations on your eResource Scheduler data.

#### Resource

- **Create:** Add a new resource specifying Resource Type Name or ID, Resource Name, and Start Date.
- **Update:** Modify the properties of an existing resource.
- **Delete:** Remove a resource from the system.
- **Get Many:** Fetch a list of resources with the specified limit.
- **Get One:** Retrieve a specific resource's details by its ID.
- **Search:** Query resources using a JSON filter body.

#### Project

- **Create:** Add a new project specifying Project Type Name or ID and Title.
- **Update:** Modify the properties of an existing project.
- **Delete:** Remove a project from the system.
- **Get Many:** Fetch a list of projects with the specified limit.
- **Get One:** Retrieve a specific project's details by its ID.
- **Search:** Query projects using a JSON filter body.

#### Booking

- **Create:** Log a new booking specifying Resource ID, Project ID, Start Time, and End Time.
- **Update:** Modify the properties of an existing booking.
- **Delete:** Remove a booking from the system.
- **Get Many:** Fetch a list of bookings with the specified limit, offset, start date, and end date.
- **Get One:** Retrieve a specific booking's details by its ID.
- **Search:** Query bookings using a JSON filter body.

#### Requirement

- **Create:** Log a new requirement specifying Project ID, Start Time, End Time, and other relevant details.
- **Update:** Modify the properties of an existing requirement.
- **Delete:** Remove a requirement from the system.
- **Get Many:** Fetch a list of requirements with the specified limit, offset, start date, and end date.
- **Get One:** Retrieve a specific requirement's details by its ID.
- **Search:** Query requirements using a JSON filter body.

#### Timesheet

- **Create:** Log a new timesheet entry specifying Resource ID, Project ID, Date, and Hours.
- **Update:** Modify the properties of an existing timesheet entry.
- **Delete:** Remove a timesheet entry from the system.
- **Get One:** Retrieve a specific timesheet entry's details by its ID.
- **Search:** Query timesheet entries using a JSON filter body.

---

## Credentials

To use this node, you need to authenticate your eResource Scheduler account with n8n. You can do this using one of two methods:

- **Access Token:** For personal use, quick integrations, or working in a controlled environment.
- **OAuth 2.0 (Rec.):** For team setups or production environments where stronger security and scoped access are required.

### Prerequisites

- **An eResource Scheduler account:** If you don't have one already, create an account at [app.eresourcescheduler.cloud](https://app.eresourcescheduler.cloud).
- **Admin access:** Required for OAuth 2.0 setup only.

### Getting Your Credentials

#### Access Token

1. Log in to your eResource Scheduler dashboard.
2. Click on your **Profile Icon** at the top right corner of the dashboard.
3. Select **Profile**, then navigate to the **Security** tab.
4. Click **Generate Token** to create your access token.
5. Copy the generated token.

#### OAuth 2.0 (Recommended)

1. Log in to your eResource Scheduler dashboard.
2. Click on your **Profile Icon** at the top right corner of the dashboard.
3. Select **Administration**.
4. In the left side panel, scroll down to the **Integration** section and click on **OAuth Application**.
5. Click **Register New Application**. Fill in the following details and click **Save**:
  - **Name**
  - **Homepage URL**
  - **Redirect URL:** Enter your n8n OAuth Redirect URL here.
  - **Description**
6. Your **Client ID** and **Client Secret** will be generated. Copy both values.

### Setting Up Credentials in n8n

#### Access Token

1. In n8n, create a new **eResource Scheduler Access Token** credential.
2. Paste your token in the **Access Token** field.
3. Click **Save** to complete the connection.

#### OAuth 2.0 (Recommended)

1. In n8n, create a new **Sign in with eResource Scheduler OAuth2** credential.
2. Copy the **OAuth Redirect URL** from n8n.
3. Paste it in the **Redirect URL** field under **Register New Application** in eResource Scheduler.
4. Enter your **Client ID** and **Client Secret** in their respective fields in n8n.
5. Click **Connect** to sign in with eResource Scheduler.

### Permissions

- **Action nodes:** The token user must have entity-level permissions for the operations you run.
- **Trigger nodes (webhooks):** Admin permissions are required to register and use webhooks.

When configuring a node, choose **Access Token** or **OAuth2 (recommended)** under **Authentication** and select the matching credential you created above.

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

## Resources

- n8n community nodes documentation:  
[https://docs.n8n.io/integrations/#community-nodes](https://docs.n8n.io/integrations/#community-nodes)
- eResource Scheduler API documentation:  
[https://apidocs.eresourcescheduler.cloud/#introduction](https://apidocs.eresourcescheduler.cloud/#introduction)
- eResource Scheduler Webhook documentation:  
[https://support.eresourcescheduler.cloud/hc/en-us/articles/52953834001305-eRS-Webhook-Documentation](https://support.eresourcescheduler.cloud/hc/en-us/articles/52953834001305-eRS-Webhook-Documentation)

---

## Compatibility

- Recommended: Latest stable version of n8n
- Tested with: n8n v2.x+
- No known incompatibility issues

---

## License

[MIT](./LICENSE)