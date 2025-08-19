# Jellyfin MCP Recommendation Server

## Overview
This is an MCP server that connects to a Jellyfin media server and exposes read-only tools/resources to an LLM agent for conversational media recommendations.

**Talk to Claude about your media library naturally:**
- *"Find me some good 90s comedies under 2 hours"*
- *"What should I watch next?"*
- *"I'm in the mood for something dark and funny"*
- *"What's new in my library?"*

It implements the contract defined in [`jellyfin-mcp.spec.yaml`](./jellyfin-mcp.spec.yaml).

## Quick Start

### Option 1: NPX (Recommended)

Use the simplified configuration with interactive authentication:

```json
{
  "mcpServers": {
    "jellyfin": {
      "command": "npx",
      "args": ["-y", "jellyfin-suggestion-mcp@latest"],
      "env": {
        "JELLYFIN_BASE_URL": "http://your-jellyfin-server:8096"
      }
    }
  }
}
```

When you first use any tool, you'll be prompted to authenticate with your Jellyfin username and password.

### Option 2: Local Development

1. **Install dependencies**: `yarn install` or `task install`
2. **Configure credentials**: Copy `.env.example` to `.env` and fill in your Jellyfin details
3. **Test connection**: `yarn test:connection` or `task test:connection`
4. **Follow setup guide**: See [`SETUP.md`](./SETUP.md) for complete configuration instructions

> ⚠️ **Security Note**: See [`SECURITY.md`](./SECURITY.md) for credential management best practices

### Authentication

The server supports two authentication methods:
- **Interactive Authentication** (new): Username/password authentication on first use
- **Pre-configured Tokens** (existing): Environment variables with API tokens

See [`AUTHENTICATION.md`](./AUTHENTICATION.md) for detailed authentication guide.

### Using Task Runner

This project uses [Task](https://taskfile.dev/) for streamlined development workflows:

```bash
task --list          # Show all available tasks
task setup           # Complete project setup
task dev             # Start development server
task ci              # Run full CI pipeline locally
```

## Documentation

- **[`README.md`](./README.md)** - Project overview and quick reference
- **[`SETUP.md`](./SETUP.md)** - Complete step-by-step setup guide
- **[`AUTHENTICATION.md`](./AUTHENTICATION.md)** - Authentication methods and troubleshooting
- **[`SECURITY.md`](./SECURITY.md)** - Security best practices and credential management

## Available Tools

Once connected to Claude Desktop, you'll have access to these Jellyfin tools:

### Media Tools
- **📚 Library Snapshot** - Quick overview of your collection
- **🔍 Search Items** - Text and filter-based search
- **📋 List Items** - Browse by category with filters
- **📺 Next Up** - Continue watching TV shows
- **🎯 Recommend Similar** - AI-powered recommendations
- **🎬 Stream Info** - Playback capability information

### Authentication Tools
- **🔐 Authenticate User** - Sign in with username/password
- **🎫 Set Token** - Use existing API token

**Example prompts:**
- *"Find me some good 90s comedies under 2 hours"*
- *"What should I watch next?"*
- *"I'm in the mood for something dark and funny"*
- *"What's new in my library?"*

## Development

### Testing
```bash
npm test              # Run spec tests
npm run test:connection  # Test Jellyfin connection
npm run test:auth     # Test authentication system
npm run get-users     # List Jellyfin users
npm run ci            # Run full CI pipeline locally
```

### Code Quality
```bash
yarn lint             # Run ESLint
yarn lint:fix         # Fix auto-fixable issues
yarn type-check       # TypeScript type checking
yarn security:audit   # Security audit of dependencies

# Or using Task
task lint             # Run ESLint
task lint:fix         # Fix auto-fixable issues
task type-check       # TypeScript type checking
task audit            # Security audit
```

### Building
```bash
yarn build            # Compile TypeScript
yarn start            # Run compiled version

# Or using Task
task build            # Compile TypeScript
task start            # Run production server
```

## Development Workflow

This project follows professional development practices:

### Package Management
- **Yarn** as the primary package manager
- Lockfile-based dependency management
- Security auditing integrated into CI/CD

### Code Quality
- **ESLint** with TypeScript support
- **Pre-commit hooks** for automated quality checks
- **Conventional commits** for standardized commit messages
- **Semantic release** for automated versioning

### CI/CD Pipeline
- **[CI Pipeline](.github/workflows/ci.yml)** - Linting, type checking, and testing
- **[Code Quality](.github/workflows/code-quality.yml)** - Advanced code analysis and documentation checks
- **[Security Scanning](.github/workflows/security.yml)** - Dependency vulnerabilities, secret scanning, and security analysis
- **[Release Automation](.github/workflows/release.yml)** - Semantic release and automated publishing
- **[Dependabot](.github/dependabot.yml)** - Automated dependency updates

### Branching Strategy
- **Trunk-based development** with `main` branch
- All workflows run on push/PR to `main` branch
- Security scans run weekly on schedule

### Task Automation
- **[Taskfile.yml](./Taskfile.yml)** provides consistent command interface
- Organized tasks for development, testing, building, and maintenance
- Run `task --list` to see all available commands
