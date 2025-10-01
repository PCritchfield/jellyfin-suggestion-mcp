# Design Document

## Overview

The username authentication feature extends the existing Jellyfin MCP server authentication system to support username/password-based authentication through both environment variables and interactive MCP tools. This design leverages the existing `AuthenticationManager` class and integrates seamlessly with the current authentication flow, providing non-admin Jellyfin users access to the MCP server while maintaining the established security and architecture patterns.

The implementation adds environment variable fallback for automated authentication (`JELLYFIN_USERNAME`/`JELLYFIN_PASSWORD`) and introduces protocol configuration support (`HTTP`/`HTTPS`) while preserving the existing API key authentication as the primary method.

## Steering Document Alignment

### Technical Standards (tech.md)

**Architecture Compliance:**
- **Event-Driven MCP Server Architecture**: Extends existing request-response pattern with additional authentication fallback mechanisms
- **Authentication Layer Integration**: Builds upon the existing pluggable authentication with enhanced session management
- **Schema Validation**: All new inputs validated using existing Zod schema patterns
- **TypeScript Strict Configuration**: Maintains strict type safety throughout authentication flow

**Dependency Management:**
- **Zero New Dependencies**: Leverages existing axios, zod, and MCP SDK components
- **Existing HTTP Client**: Uses established axios patterns for Jellyfin API communication
- **Error Handling Patterns**: Follows existing error propagation and MCP-compatible error responses

**Performance Standards:**
- **Response Time**: Username authentication within 3 seconds (meeting < 2s response requirement for API operations)
- **Memory Usage**: In-memory session management follows existing patterns without persistent credential storage
- **Session Validation**: Existing token validation mechanisms apply to username-authenticated sessions

### Project Structure (structure.md)

**Module Organization:**
- **AuthenticationManager Extension**: Enhances existing `src/auth.ts` without breaking current interfaces
- **Schema Integration**: Adds authentication schemas to existing `src/schema.ts` following established patterns
- **MCP Tool Registration**: Follows existing tool handler pattern in `src/index.ts`
- **Configuration Integration**: Uses existing environment variable patterns and MCP server initialization

**Code Size Guidelines:**
- **Enhanced AuthenticationManager**: Adds ~50 lines to existing `auth.ts` (within 200-line module limit)
- **Schema Definitions**: Adds ~10 lines to existing `schema.ts` for input validation
- **Tool Handler**: Existing `handleAuthenticateUser` already implements core functionality

## Code Reuse Analysis

### Existing Components to Leverage

- **AuthenticationManager Class**: Currently implements username authentication via `authenticateUser()` method - no changes required to core authentication logic
- **Jellyfin Client**: Existing HTTP client with proper session management and error handling patterns
- **MCP Tool Pattern**: Established tool registration and handler implementation in `index.ts`
- **Zod Schema Validation**: Existing schema patterns for input validation and type safety
- **Environment Variable Handling**: Established `getEnv()` and `mustEnv()` patterns for configuration

### Integration Points

- **Existing Authentication Flow**: New environment variable authentication integrates into existing `getAuthentication()` method hierarchy
- **Session Management**: Username sessions use identical `AuthSession` interface and validation patterns
- **MCP Tool Framework**: `authenticate_user` tool already exists - no new tool registration required
- **Error Handling**: Leverages existing `AuthenticationRequiredError` and MCP error response patterns
- **Configuration System**: Extends existing environment variable configuration pattern

## Architecture

The design follows the established MCP server architecture with minimal changes to existing components. The authentication system maintains its current three-tier priority system while adding username/password support:

1. **API Key Authentication** (highest priority) - existing environment variables
2. **Username Environment Authentication** (new middle priority) - `JELLYFIN_USERNAME`/`JELLYFIN_PASSWORD`
3. **Interactive Authentication** (fallback) - existing `authenticate_user` tool

```mermaid
graph TD
    A[MCP Tool Call] --> B[getAuthentication()]
    B --> C{In-Memory Session?}
    C -->|Yes| D[Validate Session]
    C -->|No| E{API Key Env Vars?}
    E -->|Yes| F[Validate API Key]
    E -->|No| G{Username Env Vars?}
    G -->|Yes| H[authenticateUser with Env Vars]
    G -->|No| I[Throw AuthenticationRequiredError]
    F -->|Valid| J[Store Session & Continue]
    F -->|Invalid| G
    H -->|Success| J
    H -->|Failure| I
    I --> K[User calls authenticate_user tool]
    K --> L[authenticateUser with Interactive Creds]
    L --> J
    D -->|Valid| M[Execute Tool]
    D -->|Invalid| G
    J --> M
```

### Modular Design Principles

- **Single File Responsibility**: Authentication logic remains centralized in `auth.ts`
- **Component Isolation**: New functionality extends existing components without creating new modules
- **Service Layer Separation**: Authentication service layer (AuthenticationManager) cleanly separated from MCP tool handlers
- **Utility Modularity**: Protocol configuration handled through existing environment variable utilities

## Components and Interfaces

### Enhanced AuthenticationManager

- **Purpose:** Extends existing authentication manager to support username/password environment variables and protocol configuration
- **Interfaces:**
  - Existing: `getAuthentication()`, `authenticateUser()`, `setToken()`
  - Enhanced: `getAuthentication()` with username env var fallback
- **Dependencies:** axios (existing), environment variables
- **Reuses:** Existing HTTP client, session management, token validation

**New Method Integration:**
```typescript
// Enhanced getAuthentication() method flow:
// 1. Check in-memory session (existing)
// 2. Try API key env vars (existing)
// 3. Try username env vars (NEW)
// 4. Throw AuthenticationRequiredError (existing)
```

### Protocol Configuration Component

- **Purpose:** Handle HTTP/HTTPS protocol selection through MCP configuration or environment variables
- **Interfaces:** Protocol determination logic integrated into base URL construction
- **Dependencies:** Environment variable parsing, URL validation
- **Reuses:** Existing environment variable patterns, HTTP client initialization

### Schema Validation Extensions

- **Purpose:** Add input validation schemas for authentication parameters
- **Interfaces:** Export authentication input schemas for tool validation
- **Dependencies:** Zod (existing)
- **Reuses:** Existing schema patterns and validation approach

## Data Models

### Enhanced AuthSession (Existing Interface)
```typescript
interface AuthSession {
  accessToken: string;
  userId: string;
  userName?: string;           // Already supports username from interactive auth
  serverInfo?: {
    name: string;
    version: string;
  } | undefined;
  authenticatedAt: Date;
}
```

### Authentication Input Schema (New)
```typescript
const AuthenticateUserInput = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
```

### Protocol Configuration (Environment)
```typescript
// Environment Variables:
JELLYFIN_BASE_URL: string     // Existing - may include protocol
JELLYFIN_PROTOCOL: "HTTP"|"HTTPS"  // New - optional override
JELLYFIN_USERNAME: string     // New - optional username for env auth
JELLYFIN_PASSWORD: string     // New - optional password for env auth
```

## Error Handling

### Error Scenarios

1. **Username Environment Auth Failure:**
   - **Handling:** Log failure, fallback to interactive authentication (existing pattern)
   - **User Impact:** No visible error, falls back to interactive authentication prompt

2. **Invalid Protocol Configuration:**
   - **Handling:** Validate protocol value, error with clear message if invalid
   - **User Impact:** Configuration error message with valid options (`HTTP`, `HTTPS`)

3. **Username Interactive Auth Failure:**
   - **Handling:** Use existing error handling in `authenticateUser()` method
   - **User Impact:** Clear error messages (401, 403, connection errors) as currently implemented

4. **Protocol/Base URL Conflict:**
   - **Handling:** Base URL protocol takes precedence over configuration parameter
   - **User Impact:** System uses URL protocol with optional warning log

## Testing Strategy

### Unit Testing

**New Test Cases:**
- Environment variable authentication with valid credentials
- Environment variable authentication with invalid credentials
- Protocol configuration validation (HTTP, HTTPS, invalid values)
- Base URL protocol precedence over configuration parameter
- Authentication priority order (API key → username env → interactive)

**Existing Tests to Verify:**
- Interactive authentication flow remains unchanged
- Session management and validation continues working
- MCP tool registration and handling unaffected

### Integration Testing

**Authentication Flow Testing:**
- Complete authentication chain with various credential combinations
- Fallback behavior when primary authentication methods fail
- Session persistence and reuse across multiple tool calls
- Error handling and user feedback for all failure scenarios

**Protocol Configuration Testing:**
- HTTP and HTTPS connection establishment
- Base URL parsing with and without protocol prefixes
- Configuration parameter handling and validation

### End-to-End Testing

**User Scenarios:**
1. **Environment Variable Setup**: User configures `JELLYFIN_USERNAME`/`JELLYFIN_PASSWORD` and successfully accesses library without interactive prompts
2. **API Key Priority**: User with both API key and username environment variables - system uses API key authentication
3. **Interactive Fallback**: User with no environment configuration successfully authenticates through `authenticate_user` tool
4. **Protocol Security**: User configures HTTPS protocol and successfully connects to SSL-enabled Jellyfin server
5. **Mixed Configuration**: User with partial environment configuration (username only) falls back to interactive authentication appropriately

**Integration with Claude Desktop:**
- Test complete user journey from Claude Desktop configuration through successful media library access
- Validate error messages and user experience for authentication failures
- Verify seamless operation with existing NPX installation workflow
