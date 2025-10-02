# Project Structure

## Directory Organization

```text
jellyfin-suggestion-mcp/
├── src/                        # TypeScript source code
│   ├── index.ts               # Main MCP server implementation & request handlers
│   ├── cli.ts                 # CLI entry point for npx execution
│   ├── jellyfin.ts            # Jellyfin API client with session management
│   ├── auth.ts                # Authentication manager & session handling
│   ├── schema.ts              # Zod schemas for input validation
│   ├── spec.ts                # YAML specification loader
│   ├── resources.ts           # MCP resource handlers (library snapshots)
│   ├── ranker.ts              # Recommendation ranking algorithms
│   ├── prompts.ts             # User interaction prompts (if applicable)
│   └── test-*.ts              # Integration testing utilities
├── dist/                       # Compiled JavaScript output
├── .spec-workflow/             # Specification workflow files
│   ├── templates/             # Document templates
│   ├── specs/                 # Completed specifications
│   │   └── documentation-consolidation/  # Completed: unified documentation
│   └── steering/              # Project steering documents
├── README.md                   # **UNIFIED USER GUIDE** (consolidates all documentation)
├── jellyfin-mcp.spec.yaml    # Machine-readable MCP specification
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── Taskfile.yml               # Task automation
└── [CI/build config files]    # Various config files
```

## Naming Conventions

### Files
- **Core Components**: `PascalCase` for classes, `kebab-case` for standalone utilities
- **Entry Points**: `index.ts` (main server), `cli.ts` (command-line interface)
- **Integration Layer**: `jellyfin.ts`, `auth.ts` for external service integration
- **Data Layer**: `schema.ts`, `spec.ts` for validation and configuration
- **Testing Utilities**: `test-[purpose].ts` pattern for specific test scenarios

### Code
- **Classes/Interfaces**: `PascalCase` (`JellyfinClient`, `AuthSession`)
- **Functions/Methods**: `camelCase` (`authenticateUser`, `listItems`)
- **Constants**: `UPPER_SNAKE_CASE` for environment variables, `camelCase` for local constants
- **Variables**: `camelCase` throughout, descriptive names preferred

## Import Patterns

### Import Order
1. **External dependencies**: Node.js built-ins, npm packages
2. **MCP SDK imports**: `@modelcontextprotocol/sdk` components
3. **Internal modules**: Local TypeScript modules with `.js` extension
4. **Configuration**: Environment variables via `dotenv/config`

### Module Organization
```typescript
// Standard import pattern:
import "dotenv/config";                    // Environment setup (first)
import { Server } from "@modelcontextprotocol/sdk/server/index.js"; // External
import { JellyfinClient } from "./jellyfin.js";  // Internal (with .js)
import { loadSpec } from "./spec.js";             // Relative imports
```

- **Absolute imports**: Not used, all internal imports are relative
- **File extensions**: Required `.js` extensions for TypeScript imports (ESM compatibility)
- **Dependency management**: Yarn with locked dependencies for reproducible builds

## Code Structure Patterns

### Module/File Organization
```typescript
1. Environment/configuration imports      // dotenv, config loading
2. External library imports             // MCP SDK, axios, zod
3. Internal module imports              // ./jellyfin.js, ./auth.js
4. Type definitions & interfaces        // Input schemas, response types
5. Class/function implementations       // Core business logic
6. Helper functions                     // Utilities, mappers, transformers
7. Main execution & exports             // Server startup, module exports
```

### Function/Method Organization
```typescript
- Input validation first (Zod schema parsing)
- Authentication checks (session validation)
- Core business logic (API calls, data processing)
- Error handling with typed exceptions
- Response formatting (JSON structure for MCP)
- Clear return points with proper typing
```

### File Organization Principles
- **Single responsibility**: Each file handles one major concern
- **API client isolation**: `jellyfin.ts` encapsulates all Jellyfin communication
- **Authentication separation**: `auth.ts` handles all session management
- **Validation centralized**: `schema.ts` contains all input/output schemas
- **Entry point simplicity**: `index.ts` orchestrates, delegates implementation

## Code Organization Principles

1. **MCP Protocol Compliance**: All handlers follow MCP request-response patterns
2. **Type Safety**: Zod schemas ensure runtime validation matches TypeScript types
3. **Authentication Flow**: Clear separation between authenticated and public operations
4. **Error Propagation**: Consistent error handling with MCP-compatible error responses
5. **Session Management**: Stateful authentication with graceful degradation

## Module Boundaries

### Core vs Extensions
- **Core MCP Server** (`index.ts`): Protocol handling, tool registration, request routing
- **Jellyfin Integration** (`jellyfin.ts`, `auth.ts`): External API abstraction layer
- **Validation Layer** (`schema.ts`): Input sanitization and type enforcement
- **Business Logic** (`ranker.ts`, `resources.ts`): Domain-specific algorithms

### Public API vs Internal
- **Public MCP Interface**: Tools and resources exposed to AI clients
- **Internal Modules**: Implementation details hidden behind clear interfaces
- **Configuration Layer**: Environment-based setup with sensible defaults
- **Testing Utilities**: Isolated test harnesses for development workflow

### Dependency Boundaries
```text
MCP Client → index.ts → {jellyfin.ts, auth.ts, schema.ts} → External APIs
                     ↘ {ranker.ts, resources.ts} ↗
Testing utilities ← {test-*.ts} ← All modules (for integration testing)
```

## Code Size Guidelines

### File Size Limits
- **Core handlers** (`index.ts`): ~700 lines (acceptable for MCP server complexity)
- **API clients** (`jellyfin.ts`): ~200 lines maximum per service integration
- **Utility modules**: ~100 lines maximum to maintain focused responsibility
- **Schema definitions**: Unlimited (data structure definitions)

### Function/Method Size
- **MCP tool handlers**: ~50 lines maximum (single tool responsibility)
- **API client methods**: ~30 lines maximum (focused API operations)
- **Helper functions**: ~20 lines maximum (single-purpose utilities)
- **Error handling**: Consistent 3-5 line patterns across modules

### Class/Module Complexity
- **Maximum nesting depth**: 3 levels (readable control flow)
- **Cyclomatic complexity**: ~10 maximum per function
- **Interface segregation**: Multiple small interfaces over large ones

## Module Dependencies & Integration

### Authentication Flow
```text
CLI/Environment → AuthenticationManager → JellyfinClient → MCP Tools
                              ↓
                     Session persistence (in-memory)
                              ↓
                     Error handling → AuthenticationRequiredError
```

### Request Processing Flow
```text
MCP Request → index.ts handler → Input validation (schema.ts)
                              → Authentication check (auth.ts)
                              → Jellyfin API call (jellyfin.ts)
                              → Response transformation
                              → MCP Response
```

### Testing Structure
- **Integration tests**: Full request-response cycles with live Jellyfin server
- **Unit utilities**: Focused testing of individual components
- **Connection testing**: Network and authentication validation
- **Specification compliance**: Automated testing against MCP spec
## Recent Structural Changes

### Documentation Consolidation (Completed)

**Structural Transformation**:
- **Before**: 5 separate documentation files (README.md, SETUP.md, AUTHENTICATION.md, SECURITY.md, PRD.md)
- **After**: Single unified README.md with progressive disclosure architecture
- **Files Removed**: SETUP.md, AUTHENTICATION.md, SECURITY.md, PRD.md (content consolidated into README.md)
- **Impact**: Reduced documentation maintenance overhead by 80%, eliminated content drift

**New Documentation Architecture**:
```text
README.md (Unified Guide)
├── Immediate Value (30 seconds)
│   ├── Project overview & key features
│   └── Quick decision tree (NPX vs Local)
├── Getting Started (5 minutes)
│   ├── Installation & authentication
│   └── First successful connection
├── Complete Setup (15 minutes)
│   ├── Advanced configuration
│   ├── Security best practices
│   └── Development environment
└── Advanced Usage (30+ minutes)
    ├── Contributing guidelines
    ├── Architecture deep-dive
    └── Troubleshooting reference
```

**File Removal Strategy**:
- Original files (SETUP.md, AUTHENTICATION.md, SECURITY.md, PRD.md) deleted after consolidation
- Deprecation notices added before removal for graceful migration
- All content preserved and enhanced in unified README.md
- External references redirected to appropriate README.md sections

## Documentation Standards

### Code Documentation
- **Public APIs**: Full JSDoc comments with parameter types and examples
- **Complex algorithms**: Inline comments explaining business logic
- **Error conditions**: Documented exception types and recovery strategies
- **Configuration**: Environment variable documentation with examples

### Module Documentation
- **Unified README Pattern**: Single source of truth with progressive disclosure
- **API contracts**: Clear interface definitions with expected behaviors
- **Integration guides**: Step-by-step setup and configuration instructions embedded contextually
- **Security guidelines**: Authentication and credential management best practices woven throughout workflows

### TypeScript Integration
- **Strict typing**: All functions have explicit return types
- **Interface definitions**: Shared types between modules clearly defined
- **Generic constraints**: Type parameters properly bounded for safety
- **Declaration files**: Generated declarations for npm package distribution
