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

1. **Install dependencies**: `npm install`
2. **Configure credentials**: Copy `.env.example` to `.env` and fill in your Jellyfin details
3. **Test connection**: `npm run test:connection`
4. **Follow setup guide**: See [`SETUP.md`](./SETUP.md) for complete configuration instructions

> ⚠️ **Security Note**: See [`SECURITY.md`](./SECURITY.md) for credential management best practices

## Documentation

- **[`README.md`](./README.md)** - Project overview and quick reference
- **[`SETUP.md`](./SETUP.md)** - Complete step-by-step setup guide
- **[`SECURITY.md`](./SECURITY.md)** - Security best practices and credential management

## Available Tools

Once connected to Claude Desktop, you'll have access to these Jellyfin tools:

- **📚 Library Snapshot** - Quick overview of your collection
- **🔍 Search Items** - Text and filter-based search
- **📋 List Items** - Browse by category with filters
- **📺 Next Up** - Continue watching TV shows
- **🎯 Recommend Similar** - AI-powered recommendations
- **🎬 Stream Info** - Playback capability information

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
npm run get-users     # List Jellyfin users
npm run ci            # Run full CI pipeline locally
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix auto-fixable issues
npm run type-check    # TypeScript type checking
npm run security:audit # Security audit of dependencies
```

### Building
```bash
npm run build         # Compile TypeScript
npm start            # Run compiled version
```

## CI/CD

This project includes comprehensive GitHub workflows:

- **[CI Pipeline](.github/workflows/ci.yml)** - Linting, type checking, and testing
- **[Code Quality](.github/workflows/code-quality.yml)** - Advanced code analysis and documentation checks
- **[Security Scanning](.github/workflows/security.yml)** - Dependency vulnerabilities, secret scanning, and security analysis
- **[Dependabot](.github/dependabot.yml)** - Automated dependency updates

All workflows run on push/PR to `main` and `develop` branches. Security scans also run weekly.
