# Contributing Guide

Thank you for your interest in contributing to the n8n ERS App integration! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please:

- Be respectful and inclusive
- Be collaborative
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm
- Git
- n8n (for testing)
- ERS App access (for testing)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ers-n8n.git
   cd ers-n8n
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/lavish-enbraun/ers-n8n.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

---

## Development Workflow

### Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### Make Changes

1. **Make your changes** in the feature branch
2. **Test your changes** locally
3. **Build** to ensure no errors:
   ```bash
   npm run build
   ```

4. **Lint your code**:
   ```bash
   npm run lint
   ```

5. **Fix linting issues**:
   ```bash
   npm run lint:fix
   ```

### Commit Changes

Use clear, descriptive commit messages:

```bash
git commit -m "Add support for project resource operations"
```

**Commit Message Format**:

```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples**:

```
feat: Add project resource operations

Implement create, read, update, and delete operations
for project resources in ERS App.

Closes #42
```

```
fix: Handle token refresh errors gracefully

When OAuth2 token refresh fails, show user-friendly
error message instead of generic error.

Fixes #38
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Provide type annotations
- Avoid `any` type when possible

**Example**:

```typescript
// Good
function processResource(resource: Resource): ProcessedResource {
  return {
    id: resource.id,
    name: `${resource.first_name} ${resource.last_name}`,
  };
}

// Bad
function processResource(resource: any): any {
  return {
    id: resource.id,
    name: resource.first_name + ' ' + resource.last_name,
  };
}
```

### Code Style

- Use tabs for indentation (as per project config)
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Use JSDoc for public APIs

**Example**:

```typescript
/**
 * Filters events to only include those valid for the given entity.
 * 
 * @param entity - The entity ID (1, 2, 4, 8, 16, or 32)
 * @param events - Array of event IDs to filter
 * @returns Array of valid event IDs for the entity
 * 
 * @example
 * const validEvents = getValidEventsForEntity(1, [1, 2, 4, 5]);
 * // Returns: [1, 2] (only Create and Update are valid for Resource)
 */
function getValidEventsForEntity(entity: number, events: number[]): number[] {
  const validEvents = ENTITY_VALID_EVENTS[entity];
  return events.filter(event => validEvents.includes(event));
}
```

### File Organization

```
nodes/ErsApp/
├── resources/
│   ├── resource/
│   │   ├── index.ts          # Exports
│   │   ├── create.ts         # Create operation
│   │   ├── getAll.ts         # Get Many operation
│   │   └── update.ts         # Update operation
│   └── project/
│       └── ...
├── ErsApp.node.ts            # Main node
├── ErsAppTrigger.node.ts     # Basic trigger
└── constants.ts              # Shared constants
```

### Error Handling

Always use n8n's `NodeApiError`:

```typescript
import { NodeApiError } from 'n8n-workflow';

// Good
throw new NodeApiError(this.getNode(), {
  message: 'Failed to create resource',
  description: 'The API returned an error. Please check your input data.',
  httpCode: 400,
});

// Bad
throw new Error('Failed to create resource');
```

---

## Testing

### Manual Testing

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Set up n8n for testing**:
   ```bash
   export N8N_CUSTOM_EXTENSIONS=$(pwd)
   n8n start
   ```

3. **Test in n8n UI**:
   - Create a workflow
   - Add your node
   - Configure parameters
   - Execute and verify results

### Test Checklist

Before submitting, verify:

- [ ] Node appears in n8n UI
- [ ] Parameters display correctly
- [ ] Operations execute successfully
- [ ] Error handling works
- [ ] Documentation is updated
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Credentials work (if applicable)

### Testing Webhooks

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

## Documentation

### Update Documentation

When adding features, update:

1. **API.md** - API reference
2. **USAGE.md** - Usage examples
3. **WEBHOOKS.md** - Webhook docs (if applicable)
4. **README.md** - Main readme
5. **JSDoc comments** - In code

### Documentation Style

- Use clear, concise language
- Provide examples
- Include code snippets
- Add screenshots when helpful
- Link related documentation

**Example**:

```markdown
## Create Resource

Creates a new resource in ERS App.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `first_name` | string | Yes | First name of the resource |
| `start_date` | dateTime | Yes | Start date (YYYY-MM-DD) |

### Example

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "start_date": "2024-01-15",
  "resource_type_id": 1
}
```

### Response

```json
{
  "id": 456,
  "first_name": "John",
  "last_name": "Doe",
  "start_date": "2024-01-15"
}
```
```

---

## Submitting Changes

### Before Submitting

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run checks**:
   ```bash
   npm run build
   npm run lint
   ```

3. **Test thoroughly**

4. **Update documentation**

### Create Pull Request

1. **Push to your fork**:
   ```bash
   git push origin your-feature-branch
   ```

2. **Open Pull Request** on GitHub

3. **Fill out PR template**:

   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Documentation update
   - [ ] Other
   
   ## Testing
   - [ ] Manual testing completed
   - [ ] No errors in console
   - [ ] Documentation updated
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   
   ## Related Issues
   Closes #123
   ```

4. **Wait for review**

### PR Review Process

1. **Maintainer reviews** your PR
2. **Address feedback** if requested
3. **Update your branch** as needed
4. **Approval and merge**

### After Merge

1. **Update your local repo**:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Delete feature branch**:
   ```bash
   git branch -d your-feature-branch
   git push origin --delete your-feature-branch
   ```

---

## Feature Requests

### Before Requesting

1. **Search existing issues** to avoid duplicates
2. **Check documentation** - feature might already exist
3. **Discuss in GitHub Discussions** for large changes

### Creating Feature Request

Use the issue template:

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Screenshots, examples, etc.
```

---

## Bug Reports

### Before Reporting

1. **Search existing issues**
2. **Try latest version**
3. **Check troubleshooting guide**

### Creating Bug Report

Use the issue template:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- n8n version: 0.210.0
- Node.js version: 18.0.0
- OS: Ubuntu 22.04

## Error Message
```
Paste error message here
```

## Screenshots
[Attach if applicable]

## Additional Context
Any other relevant information
```

---

## Areas Needing Contribution

We welcome contributions in these areas:

### High Priority

- [ ] Update and Delete operations for resources
- [ ] Project resource support
- [ ] Booking resource support
- [ ] Error message improvements
- [ ] More usage examples

### Medium Priority

- [ ] Signed webhooks
- [ ] Rate limiting implementation
- [ ] Batch operation improvements
- [ ] Performance optimization
- [ ] More comprehensive testing

### Documentation

- [ ] Video tutorials
- [ ] More workflow examples
- [ ] Translation to other languages
- [ ] Architecture documentation

---

## Development Tips

### Local Testing

**Use ngrok for webhook testing**:

```bash
ngrok http 5678
```

**Watch mode for auto-rebuild**:

```bash
npm run build:watch
```

**n8n dev mode**:

```bash
npm run dev
```

### Debugging

**Enable debug logs**:

```bash
export N8N_LOG_LEVEL=debug
n8n start
```

**Check logs**:

```bash
tail -f ~/.n8n/logs/n8n.log
```

**Browser console**:

Press F12 in n8n UI and check Console tab

---

## Questions?

- 📖 Read the [documentation](../README.md)
- 💬 Open a [GitHub Discussion](https://github.com/lavish-enbraun/ers-n8n/discussions)
- 📧 Email: lavish.pareta@enbraun.com

---

## Thank You!

Thank you for contributing to the n8n ERS App integration! Your contributions help make this project better for everyone.

---

**Last Updated**: November 28, 2025
