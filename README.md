# Jellyfin MCP Recommendation Server

## Overview
This is an MCP server that connects to a Jellyfin media server and exposes read-only tools/resources to an LLM agent for conversational media recommendations.

**Talk to Claude about your media library naturally:**
- *"Find me some good 90s comedies under 2 hours"*
- *"What should I watch next?"*
- *"I'm in the mood for something dark and funny"*
- *"What's new in my library?"*

It implements the contract defined in [`jellyfin-mcp.spec.yaml`](./jellyfin-mcp.spec.yaml).

---

## 📖 Table of Contents

### 🚀 Getting Started
- **[Quick Start](#-quick-start)** - Choose your installation method
  - [NPX Installation (Recommended)](#npx-installation-recommended) - End users, quick testing
  - [Local Development Setup](#local-development-setup) - Developers, contributors
  - [Secure Configuration](#secure-configuration) - Security-conscious users
  - [Quick Troubleshooting](#quick-troubleshooting) - Common issues and solutions

### 🔒 Security & Authentication
- **[Security Best Practices](#-security-best-practices)** - Comprehensive security guidance
  - [Core Security Principles](#core-security-principles) - Critical security warnings
  - [Security Considerations & Threat Model](#-security-considerations--threat-model) - Risk assessment
  - [Security Checklist](#-security-checklist) - 8-item actionable checklist
  - [Token Management](#-token-management) - Creation, rotation, and storage
  - [Production Security](#-production-security) - Enterprise deployment guidance
  - [Security Monitoring](#-security-monitoring) - Threat detection and red flags

### 🔧 Development & Contribution Guide
- **[Development & Contribution](#-development--contribution)** - Complete developer guide
  - [Quick Development Setup](#quick-development-setup) - Get started in 5 minutes
  - [Development Commands](#development-commands) - Testing, quality, building
  - [Project Architecture](#project-architecture) - Technical foundation
  - [Code Quality Standards](#code-quality-standards) - Automated quality assurance
  - [Development Workflow](#development-workflow) - CI/CD and branching
  - [Contributing Guidelines](#contributing-guidelines) - Step-by-step contribution process
  - [Task Automation](#task-automation) - Complete task reference

### 📚 Reference & Tools
- **[Available Tools](#available-tools)** - Media and authentication tools
- **[Documentation](#-documentation)** - Additional documentation files

---

## 🚀 Quick Start

### Choose Your Path

**🎈 Just Want to Try It?** → [NPX Installation](#npx-installation-recommended)
**🔧 Local Development?** → [Local Development Setup](#local-development-setup)
**🔒 Need Maximum Security?** → [Secure Configuration Guide](#secure-configuration)

---

### NPX Installation (Recommended)

**Perfect for:** End users, quick testing, production deployments

**Prerequisites:**
- Node.js v20+ installed
- Jellyfin server running and accessible
- Claude Desktop app installed

**Setup (2 minutes):**

1. **Add to Claude Desktop config** (`claude_desktop_config.json`):

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

2. **Restart Claude Desktop** completely

3. **Test it works:** In a new Claude conversation, try:

   ```text
   "What's in my Jellyfin library?"
   ```

4. **Authenticate when prompted:** The first time you use any tool, Claude will show:

   ```text
   Error: Authentication required. Please use the authenticate_user tool to sign in, then your request will be automatically retried.
   ```

   Simply tell Claude: **"Please authenticate me"** and provide your Jellyfin credentials when asked.
   **What happens next:**
   - Claude calls the `authenticate_user` tool with your username/password
   - The system generates a secure session token
   - Your original request is automatically retried
   - You see both authentication success and your requested data

   **🔒 Security Notes:**
   - Credentials are never logged or stored persistently
   - Session tokens exist only in memory during your Claude conversation
   - Each new Claude conversation requires re-authentication

**✅ Success:** You should see your library overview and be able to ask for recommendations!

**❌ Having issues?** Jump to [Quick Troubleshooting](#quick-troubleshooting)

---

### Local Development Setup

**Perfect for:** Developers, contributors, customization, advanced configuration

**Prerequisites:**

- Node.js v20+ installed
- Git installed
- Jellyfin server running and accessible
- Claude Desktop app installed

**Setup (5 minutes):**

1. **Clone and install:**

   ```bash
   git clone https://github.com/PCritchfield/jellyfin-suggestion-mcp.git
   cd jellyfin-suggestion-mcp
   yarn install
   # OR: task install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your Jellyfin server details
   ```

   **Choose your authentication method:**

   **Option A: Interactive Authentication (Recommended)**

   ```env
   # .env file - minimal configuration
   JELLYFIN_BASE_URL=http://your-jellyfin-server:8096
   ```

   You'll authenticate with username/password when Claude asks.

   **Option B: Environment Username/Password**

   ```env
   # .env file - username/password authentication
   JELLYFIN_BASE_URL=http://your-jellyfin-server:8096
   JELLYFIN_USERNAME=your-jellyfin-username
   JELLYFIN_PASSWORD=your-jellyfin-password
   JELLYFIN_PROTOCOL=https  # Optional: http or https (defaults to https)
   ```

   **Option C: Pre-configured Token**

   ```env
   # .env file - token-based authentication
   JELLYFIN_BASE_URL=http://your-jellyfin-server:8096
   JELLYFIN_USER_ID=your-user-id-guid-here
   JELLYFIN_TOKEN=your-api-token-here
   ```

   **How to get API tokens:**
   1. Run `yarn get-users` to find your User ID
   2. Go to Jellyfin Dashboard → API Keys
   3. Create new API key named "MCP Server"
   4. Copy the token to your `.env` file

3. **Test connection:**

   ```bash
   yarn test:connection
   # OR: task test:connection
   ```

   Expected output: `✅ Jellyfin connection successful!`

   **Authentication testing:**

   ```bash
   yarn test:auth
   # Verifies both interactive and token-based authentication
   ```

4. **Add to Claude Desktop config:**

   ```json
   {
     "mcpServers": {
       "jellyfin": {
         "command": "node",
         "args": ["--import", "tsx/esm", "/full/path/to/your/project/src/index.ts"],
         "cwd": "/full/path/to/your/project",
         "env": {
           "JELLYFIN_BASE_URL": "http://your-jellyfin-server:8096"
         }
       }
     }
   }
   ```

5. **Restart Claude Desktop** and test with: `"What's in my Jellyfin library?"`

**🛠️ Development commands:**

```bash
task --list          # Show all available tasks
task dev             # Start development server with hot reload
task test            # Run all tests
task lint            # Check code quality
```

---

### Secure Configuration

**Perfect for:** Security-conscious users, shared systems, production environments

Choose your preferred security approach:

**🔐 Environment Variables (Recommended):**

*For token-based authentication:*

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export JELLYFIN_BASE_URL="http://your-jellyfin-server:8096"
export JELLYFIN_USER_ID="your-user-id-here"
export JELLYFIN_TOKEN="your-api-token-here"
```

*For username/password authentication:*

```bash
# Username/password environment setup
export JELLYFIN_BASE_URL="your-jellyfin-server:8096"  # Without protocol
export JELLYFIN_USERNAME="your-jellyfin-username"
export JELLYFIN_PASSWORD="your-jellyfin-password"
export JELLYFIN_PROTOCOL="https"  # Optional: http or https (defaults to https)
```

*For interactive authentication:*

```bash
# Minimal environment setup
export JELLYFIN_BASE_URL="http://your-jellyfin-server:8096"
# No credentials needed - authenticate with username/password when prompted

```

Then use a clean Claude config without embedded credentials:

```json
{
  "mcpServers": {
    "jellyfin": {
      "command": "npx",
      "args": ["-y", "jellyfin-suggestion-mcp@latest"]
    }
  }
}
```

**📁 Local Config File:**

```bash
# Keep sensitive config separate from shared files
cp claude_desktop_config.json claude_desktop_config.local.json
# Edit local version with credentials, share the example version
```

**🔄 Authentication Method Migration:**

*From token-based to interactive:*

- Remove `JELLYFIN_USER_ID` and `JELLYFIN_TOKEN` from environment
- Keep only `JELLYFIN_BASE_URL`
- Next Claude conversation will prompt for username/password

*From interactive to username/password environment:*

- Add `JELLYFIN_USERNAME` and `JELLYFIN_PASSWORD` to environment
- Optionally set `JELLYFIN_PROTOCOL` for HTTP/HTTPS preference
- Restart Claude Desktop for automatic authentication

*From username/password to token-based:*

- Get API token from Jellyfin Dashboard → API Keys
- Replace `JELLYFIN_USERNAME` and `JELLYFIN_PASSWORD` with `JELLYFIN_USER_ID` and `JELLYFIN_TOKEN`
- Restart Claude Desktop

**🔑 API Token Setup:**

1. Go to Jellyfin Dashboard → API Keys
2. Create new API key for this application
3. Use token-based authentication instead of interactive

> 💡 **Want more security options?** See [Complete Security Guide](#-security-best-practices) below

---

### Quick Troubleshooting

**Server won't start?**

```bash
# Check for errors
yarn build
yarn test:connection
```

**Claude can't connect?**

1. Verify server is running (`yarn dev` or `npx` process)
2. Check file paths in `claude_desktop_config.json` are absolute and correct
3. Restart Claude Desktop completely
4. Look for errors in Claude Desktop logs

**Authentication failing?**

*Connection Issues:*

``` shell
Cannot connect to Jellyfin server at http://...
```

- Verify the `JELLYFIN_BASE_URL` is correct and accessible
- Check that Jellyfin server is running and reachable
- Ensure firewall/network settings allow access

*Interactive Authentication Problems:*

``` shell
Invalid username or password
```

- Verify your Jellyfin credentials are correct
- Check that the user account is enabled in Jellyfin
- Ensure the user has permission to sign in

*Token Authentication Issues:*

``` shell
Invalid or expired token
```

- Re-authenticate using interactive method
- Check that the API token hasn't been revoked in Jellyfin Dashboard
- Verify `JELLYFIN_USER_ID` matches the token owner

*Username/Password Environment Issues:*

``` shell
Environment username/password authentication failed
```

- Verify `JELLYFIN_USERNAME` and `JELLYFIN_PASSWORD` are correct
- Check that the user account is enabled in Jellyfin
- Ensure credentials match a valid Jellyfin user account

*Protocol Configuration Issues:*

``` shell
Invalid JELLYFIN_PROTOCOL "xyz". Must be "http" or "https"
```

- Use only `http` or `https` for `JELLYFIN_PROTOCOL` (case insensitive)
- If `JELLYFIN_BASE_URL` includes protocol, it takes precedence
- Defaults to HTTPS if no protocol specified for security

**Test your authentication:**

```bash
yarn test:auth  # Tests both interactive and token-based auth
yarn test:connection  # Basic connection test
yarn tsx src/test-auth-env.ts  # Test environment variable authentication priority
yarn tsx src/test-protocol.ts  # Test protocol configuration
```

**Still stuck?** See [Quick Troubleshooting](#quick-troubleshooting) above or [open an issue](https://github.com/PCritchfield/jellyfin-suggestion-mcp/issues).

[↑ Back to Top](#-table-of-contents)

---

## 🔒 Security Best Practices

### Core Security Principles

> **⚠️ CRITICAL:** Your Jellyfin credentials should **never** be committed to version control or shared publicly.

**🛡️ Implemented Security Measures:**

- **Gitignore Protection** - Sensitive config files excluded from version control
- **Example Templates** - Placeholder configs provided for safe sharing
- **Environment Variable Support** - Server reads credentials from secure environment
- **Session Management** - Credentials stored in memory only during Claude conversations
- **No Credential Logging** - Usernames, passwords, and tokens are never logged

### 🚨 Security Considerations & Threat Model

**API Token Scope:**

- Jellyfin API tokens have **broad access** to your media server
- Consider creating a **dedicated read-only user** for this application
- Tokens can access all media and user data within granted permissions

**Network Exposure:**

- Risk increases if Jellyfin is accessible outside your local network
- Ensure proper firewall configuration if exposing Jellyfin externally
- Consider VPN access instead of direct internet exposure

**Credential Storage:**

- Claude Desktop config files may contain sensitive information
- Environment variables are more secure than embedded credentials
- Local config files should be properly protected with file permissions

### 📋 Security Checklist

Complete this checklist for secure deployment:

- [ ] **Credential Management**: Choose secure credential approach (environment variables recommended)
- [ ] **Remove Hardcoded Credentials**: No credentials in committed config files
- [ ] **Jellyfin User Permissions**: Review and minimize user permissions (consider read-only user)
- [ ] **Token Rotation Plan**: Schedule periodic API token rotation
- [ ] **Network Security**: Verify Jellyfin network exposure and firewall settings
- [ ] **File Permissions**: Secure local config files with appropriate permissions
- [ ] **Backup Security**: Ensure backups don't expose credentials
- [ ] **Team Access**: If sharing, use example configs without real credentials

### 🔄 Token Management

**Creating Secure API Tokens:**

1. **Create Dedicated User**: Consider a read-only user for MCP access
2. **Generate Token**: Jellyfin Dashboard → API Keys → Create new key
3. **Secure Storage**: Store in environment variables, not config files
4. **Regular Rotation**: Rotate tokens periodically (recommended: quarterly)

**Token Rotation Process:**

1. Generate new token in Jellyfin Dashboard
2. Update environment variables or secure config
3. Test new token with `yarn test:auth`
4. Delete old token from Jellyfin Dashboard
5. Restart Claude Desktop to use new token

### 🏭 Production Security

**For Production Deployments:**

- Use proper **secrets management systems** (HashiCorp Vault, AWS Secrets Manager, etc.)
- Implement **token rotation automation**
- Enable **audit logging** for credential access
- Use **dedicated service accounts** with minimal permissions
- Implement **network segmentation** for media server access

**Environment-Specific Considerations:**

- **Development**: Environment variables in shell profile
- **CI/CD**: Encrypted environment variables or secrets
- **Production**: Enterprise secrets management with rotation
- **Shared Systems**: User-specific credential isolation

### 🔍 Security Monitoring

**What to Monitor:**

- Failed authentication attempts
- Unusual API usage patterns
- Token usage from unexpected sources
- Network connections to Jellyfin server

**Red Flags:**

- Multiple authentication failures
- API calls outside normal usage patterns
- Connections from unexpected IP addresses
- Tokens being used simultaneously from different locations

> 💡 **Security Questions?** Review the complete [threat model](#-security-considerations--threat-model) above or [open a security issue](https://github.com/PCritchfield/jellyfin-suggestion-mcp/security) for guidance.

[↑ Back to Top](#-table-of-contents)

---

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

> 💡 **Need help getting started?** Jump to [Quick Start](#-quick-start) for installation instructions.

[↑ Back to Top](#-table-of-contents)

---

## 📚 Documentation

### Primary Documentation

- **[`README.md`](./README.md)** - **Complete user guide** with installation, authentication, security, and development
  - All setup procedures consolidated with progressive disclosure
  - Comprehensive security best practices embedded throughout
  - Development workflow and contribution guidelines
  - Internal navigation and cross-references for easy access

### Archived Documentation

The following files contain the original detailed documentation and remain available for reference:

- **[`SETUP.md`](./SETUP.md)** - *(Archived)* Original detailed setup guide
- **[`AUTHENTICATION.md`](./AUTHENTICATION.md)** - *(Archived)* Original authentication documentation
- **[`SECURITY.md`](./SECURITY.md)** - *(Archived)* Original security best practices
- **[`PRD.md`](./PRD.md)** - Product Requirements Document (technical specifications)

### Migration Information

> 📋 **For Existing Users**: All information from the archived files has been integrated into this README with improved organization and cross-referencing. The archived files will remain available for backward compatibility but **this README is now the primary documentation source**.
>
> 🔗 **External Links**: If you have bookmarks or external references to the archived documentation files, they will continue to work, but we recommend updating links to point to the relevant sections in this README for the best experience.

[↑ Back to Top](#-table-of-contents)

---

## 🔧 Development & Contribution

### Quick Development Setup

**Prerequisites:**
- Node.js v20+ installed
- Yarn package manager
- Jellyfin server for testing

**Get Started:**
```bash
git clone https://github.com/PCritchfield/jellyfin-suggestion-mcp.git
cd jellyfin-suggestion-mcp
yarn install
task setup              # Complete project setup
task dev                # Start development server with hot reload
```

---

### Development Commands

**🧪 Testing & Validation:**
```bash
# Basic testing
yarn test               # Run spec tests
yarn test:connection    # Test Jellyfin connection
yarn test:auth          # Test authentication system
yarn get-users          # List Jellyfin users

# Full validation
task ci                 # Run complete CI pipeline locally
task test:spec          # Run spec acceptance tests
```

**🔍 Code Quality:**
```bash
# Linting and formatting
yarn lint               # Run ESLint
yarn lint:fix           # Fix auto-fixable issues
yarn type-check         # TypeScript type checking
yarn security:audit     # Security audit of dependencies

# Task runner equivalents
task lint               # ESLint with TypeScript support
task lint:fix           # Auto-fix code quality issues
task type-check         # Full TypeScript validation
task audit              # Security and dependency audit
```

**🏗️ Building & Running:**
```bash
# Development
task dev                # Development server with hot reload
task build              # Compile TypeScript to JavaScript
task start              # Run compiled production server

# Production
yarn build && yarn start    # Build and run production version
```

---

### Project Architecture

**Technical Foundation:**
- **Language**: TypeScript with strict type checking
- **Platform**: MCP 1.2+ protocol specification
- **Target**: Jellyfin 10.8+ media server compatibility
- **Performance**: < 2s response time for ≤ 24 items on ≤ 20k-item libraries

**Key Components:**
- **MCP Server Implementation** - Core server following MCP specification
- **Jellyfin Integration** - Read-only API client with authentication
- **Spec Validation** - Machine-readable `jellyfin-mcp.spec.yaml`
- **Test Harness** - Automated spec acceptance testing
---

### Code Quality Standards

**Automated Quality Assurance:**
- **ESLint** with TypeScript support and strict rules
- **Pre-commit hooks** for automated quality checks on commit
- **Conventional commits** for standardized commit messages
- **Semantic release** for automated versioning and changelog

**Security & Privacy:**
- **No credential logging** - Sensitive data never logged
- **Redacted URLs** - File paths and stream URLs redacted by default
- **Kid-mode respect** - Child safety policies enforced
- **Token validation** - All API tokens validated before use

---

### Development Workflow

**Package Management:**
- **Yarn** as primary package manager with lockfile-based dependency management
- **Security auditing** integrated into CI/CD pipeline
- **Automated dependency updates** via Dependabot

**Branching Strategy:**
- **Trunk-based development** with `main` branch
- **All workflows** run on push/PR to `main` branch
- **Security scans** run weekly on schedule
- **No breaking changes** without major version bump

**CI/CD Pipeline:**
- **[CI Pipeline](.github/workflows/ci.yml)** - Linting, type checking, and testing
- **[Code Quality](.github/workflows/code-quality.yml)** - Advanced code analysis and documentation checks
- **[Security Scanning](.github/workflows/security.yml)** - Dependency vulnerabilities, secret scanning, and security analysis
- **[Release Automation](.github/workflows/release.yml)** - Semantic release and automated publishing

---

### Contributing Guidelines

**How to Contribute:**

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/jellyfin-suggestion-mcp.git
   cd jellyfin-suggestion-mcp
   ```

2. **Set Up Development Environment:**
   ```bash
   yarn install
   task setup
   task test:connection    # Verify your Jellyfin connection
   ```

3. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes:**
   - Follow existing code style and TypeScript patterns
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all quality checks pass: `task ci`

5. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # Follow conventional commit format
   ```

6. **Submit Pull Request:**
   - Ensure all CI checks pass
   - Include clear description of changes
   - Reference any related issues

**Contribution Standards:**
- **Code Coverage**: Maintain or improve test coverage
- **Spec Compliance**: All spec acceptance tests must pass
- **Documentation**: Update docs for any user-facing changes
- **Compatibility**: Maintain backward compatibility unless major version
- **Performance**: Ensure changes don't degrade response times

**Success Metrics for Contributions:**
- 100% of spec tests pass in CI
- LLM-driven media requests return valid items 95%+ of the time
- Kid-mode and result caps enforced in 100% of relevant calls
- No breaking changes without major version bump

---

### Task Automation

**Available Commands:**
```bash
task --list              # Show all available tasks
task setup               # Complete project setup
task dev                 # Start development server
task test                # Run all tests
task lint                # Code quality checks
task build               # Build for production
task ci                  # Full CI pipeline locally
```

**Task Categories:**
- **Setup & Installation** - Project initialization and dependencies
- **Development** - Live development server and hot reload
- **Testing** - Unit tests, integration tests, and spec validation
- **Quality** - Linting, type checking, and security audits
- **Building** - TypeScript compilation and production builds
- **Maintenance** - Dependency updates and cleanup

> 📖 **Full Task Reference**: See [`Taskfile.yml`](./Taskfile.yml) for complete task definitions and usage

[↑ Back to Top](#-table-of-contents)
