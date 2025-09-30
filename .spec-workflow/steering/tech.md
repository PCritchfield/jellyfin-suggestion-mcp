# Technology Stack

## Project Type

**MCP Server**: A Model Context Protocol server that bridges AI assistants with Jellyfin media libraries, enabling conversational media discovery through structured tool interfaces.

## Core Technologies

### Primary Language(s)

- **Language**: TypeScript (targeting ES2022)
- **Runtime/Compiler**: Node.js 18+ with native ESM support
- **Language-specific tools**:
  - **Package Manager**: Yarn with lockfile-based dependency management
  - **Build System**: TypeScript Compiler (tsc) with strict type checking
  - **Development Runtime**: tsx for hot reloading during development

### Key Dependencies/Libraries

- **@modelcontextprotocol/sdk ^1.17.2**: Core MCP protocol implementation for server creation and request handling
- **axios ^1.11.0**: HTTP client for Jellyfin API communication with request/response interceptors
- **zod ^4.0.17**: Runtime type validation and schema parsing for API inputs/outputs
- **dotenv ^17.2.1**: Environment variable management for configuration
- **yaml ^2.8.1**: YAML parsing for specification loading and validation

### Application Architecture

**Event-Driven MCP Server Architecture**:

- **Request-Response Pattern**: Handles MCP protocol requests (tools, resources) via registered handlers
- **Authentication Layer**: Pluggable authentication with session management and token-based API access
- **Client Abstraction**: JellyfinClient wrapper providing type-safe API access with error handling
- **Schema Validation**: Input/output validation using Zod schemas ensuring type safety
- **Recommendation Engine**: Pluggable ranking system for similarity matching and personalization

### Data Storage (if applicable)

- **Primary storage**: External Jellyfin server database (PostgreSQL/SQLite) - read-only access
- **Caching**: In-memory session storage for authentication tokens and pending requests
- **Data formats**: JSON for MCP protocol communication, YAML for specification files

### External Integrations (if applicable)

- **APIs**: Jellyfin Server REST API (10.8+) for media library access
- **Protocols**: HTTP/REST over configurable base URLs, MCP over stdio transport
- **Authentication**: Jellyfin API token authentication with username/password fallback

### Monitoring & Dashboard Technologies (if applicable)

- **Dashboard Framework**: CLI-based development tools and test harnesses
- **Real-time Communication**: stdio transport for MCP protocol communication
- **Visualization Libraries**: JSON pretty-printing for debug output and API responses
- **State Management**: In-memory session state with authentication token persistence

## Development Environment

### Build & Development Tools

- **Build System**: TypeScript compiler with source maps and declaration files
- **Package Management**: Yarn with frozen lockfiles and dependency auditing
- **Development workflow**:
  - **Hot Reload**: tsx for immediate TypeScript execution
  - **Watch Mode**: File watching for automatic rebuilds
  - **CLI Tools**: Dedicated test utilities for connection and authentication testing

### Code Quality Tools

- **Static Analysis**:
  - ESLint 9.33+ with TypeScript support and strict configuration
  - TypeScript strict mode with exactOptionalPropertyTypes and noUncheckedIndexedAccess
- **Formatting**: ESLint auto-fix with consistent code style enforcement
- **Testing Framework**:
  - Custom test harness for MCP specification compliance
  - Integration tests for Jellyfin API communication
  - Authentication flow testing utilities
- **Documentation**: Inline JSDoc comments with TypeScript declaration generation

### Version Control & Collaboration

- **VCS**: Git with conventional commits and semantic versioning
- **Branching Strategy**: Trunk-based development with main branch
- **Code Review Process**:
  - **Pre-commit hooks**: Automated code quality checks with husky
  - **CI/CD Integration**: Automated linting, type checking, and security auditing
  - **Semantic Release**: Automated versioning and changelog generation

### Dashboard Development (if applicable)

- **Live Reload**: Development server with automatic restart on file changes
- **Port Management**: stdio-based communication (no port conflicts)
- **Multi-Instance Support**: Session-isolated authentication allowing multiple concurrent users

## Deployment & Distribution (if applicable)

- **Target Platform(s)**: Node.js environments (local development, CI/CD, production servers)
- **Distribution Method**:
  - **NPM Registry**: Published as `jellyfin-suggestion-mcp` for global installation
  - **NPX Support**: Zero-install usage via `npx jellyfin-suggestion-mcp@latest`
- **Installation Requirements**: Node.js 18+, network access to Jellyfin server
- **Update Mechanism**: NPM/Yarn package updates with semantic versioning

## Technical Requirements & Constraints

### Performance Requirements

- **Response Time**: < 2 seconds for ≤ 24 items on ≤ 20k-item libraries
- **Memory Usage**: Minimal memory footprint with streaming JSON processing
- **Concurrency**: Single-threaded with async/await patterns for I/O operations
- **Library Size**: Efficient handling of large media libraries (20k+ items)

### Compatibility Requirements

- **Platform Support**: Node.js 18+ on Linux, macOS, Windows
- **Dependency Versions**:
  - MCP SDK 1.17+, Jellyfin Server 10.8+
  - TypeScript 5.9+, ESLint 9.33+
- **Standards Compliance**:
  - MCP Protocol 1.2+ specification compliance
  - OpenAPI-compatible tool schemas
  - JSON Schema validation for all inputs/outputs

### Security & Compliance

- **Security Requirements**:
  - No credential storage in memory or logs
  - Username/password authentication for non-admin users (API keys restricted to admins)
  - Secure token-based session management with automatic expiration
  - Input sanitization and output redaction (file paths, stream URLs)
- **Compliance Standards**: Read-only access patterns, GDPR-compatible (no PII storage)
- **Threat Model**:
  - **Network Security**: HTTPS for Jellyfin communication, configurable base URLs
  - **Authentication Security**: Interactive authentication flow for secure credential handling
  - **Input Validation**: All user inputs validated via Zod schemas
  - **Output Sanitization**: Sensitive data automatically redacted from responses

### Scalability & Reliability

- **Expected Load**: Single-user sessions with moderate request volume (< 10 RPS)
- **Availability Requirements**: Graceful degradation with authentication errors
- **Growth Projections**: Support for multiple Jellyfin instances and enhanced recommendation algorithms

## Technical Decisions & Rationale

### Decision Log

1. **TypeScript with Strict Configuration**: Chosen for type safety in MCP protocol handling and Jellyfin API integration. Strict settings prevent common runtime errors in AI-driven environments.

2. **Zod for Runtime Validation**: Selected over alternatives like Joi for better TypeScript integration and zero-dependency validation of MCP inputs, ensuring protocol compliance.

3. **Axios over Fetch**: Preferred for mature error handling, request/response interceptors for authentication, and better compatibility with legacy Node.js versions.

4. **In-Memory Session Management**: Simplified approach avoiding persistent storage complexity while maintaining security through token-based authentication patterns.

5. **Task Runner over NPM Scripts**: Task (Taskfile.yml) provides better organization of complex development workflows and cross-platform compatibility.

6. **Progressive Disclosure Documentation Architecture**: Implemented unified README.md with 4-level complexity hierarchy (30s → 5min → 15min → 30+min) to reduce cognitive load and improve user onboarding success rates. Decision validated through complete user workflow testing.

## Recent Technical Achievements

### Documentation Consolidation Implementation (Completed)

**Technical Scope**: Consolidated 5 separate documentation files (README.md, SETUP.md, AUTHENTICATION.md, SECURITY.md, PRD.md) into unified README.md with progressive disclosure architecture.

**Implementation Details**:
- **Content Inventory System**: Mapped all unique content with user journey categorization and priority levels
- **Progressive Disclosure Architecture**: 4-level information hierarchy enabling complexity scaling from immediate value (30s) to advanced usage (30+ min)
- **Internal Navigation System**: GitHub markdown-compatible table of contents with anchor links and cross-references supporting 3-click information access
- **Security Integration**: Contextual embedding of security best practices throughout setup workflows while maintaining dedicated comprehensive security section
- **Migration Strategy**: Graceful archival with deprecation notices maintaining backward compatibility for existing user workflows

**Technical Validation**:
- ✅ Complete user workflow testing from fresh environments
- ✅ All installation paths (NPX, local development) verified functional
- ✅ Authentication flows (interactive, token-based) validated
- ✅ Internal linking system tested for GitHub markdown compatibility
- ✅ Mobile responsiveness and accessibility standards met

**Maintainability Impact**:
- **Single Source of Truth**: Eliminated documentation drift across multiple files
- **Automated Validation**: Integration with existing CI/CD pipeline for documentation testing
- **Developer Experience**: Unified contribution guidelines with clear onboarding paths

## Known Limitations

- **Authentication Constraints**: Jellyfin API keys are only available to admin users, requiring username/password authentication for non-admin users to leverage the MCP server effectively
- **Single Session Limitation**: Currently supports one authenticated user per MCP server instance (concurrent user support planned)
- **Basic Recommendation Engine**: Simple similarity matching algorithm (advanced ML-based recommendations in roadmap)
- **No Offline Support**: Requires active network connection to Jellyfin server for all operations
- **Memory-Only Caching**: No persistent caching of library metadata (Redis/disk caching under consideration)
