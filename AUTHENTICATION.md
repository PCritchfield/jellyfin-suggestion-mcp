# Jellyfin MCP Authentication Guide

This guide explains how to use the new authentication system in the Jellyfin MCP server.

## Overview

The Jellyfin MCP server now supports two authentication methods:

1. **Environment Variables** (existing method) - Pre-configured tokens
2. **Interactive Authentication** (new method) - Username/password authentication

## Quick Start

### Method 1: Simplified Configuration (Recommended)

Use the new simplified configuration that only requires the Jellyfin server URL:

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

When you first use any MCP tool, you'll be prompted to authenticate:

1. Use the `authenticate_user` tool with your Jellyfin username and password
2. Your original request will be automatically retried after successful authentication
3. The session will be maintained for the duration of the MCP connection

### Method 2: Pre-configured Tokens (Existing)

If you prefer to use pre-configured API tokens:

```json
{
  "mcpServers": {
    "jellyfin": {
      "command": "npx",
      "args": ["-y", "jellyfin-suggestion-mcp@latest"],
      "env": {
        "JELLYFIN_BASE_URL": "http://your-jellyfin-server:8096",
        "JELLYFIN_USER_ID": "your-user-id-guid",
        "JELLYFIN_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Authentication Tools

### `authenticate_user`

Exchange username/password for a user-scoped access token.

**Input:**
```json
{
  "username": "your-jellyfin-username",
  "password": "your-jellyfin-password"
}
```

**Output:**
```json
{
  "ok": true,
  "user": {
    "id": "user-guid",
    "name": "Username"
  },
  "access_token": "generated-token",
  "retried_request": {
    "tool": "list_items",
    "result": { /* original request results */ }
  }
}
```

### `set_token`

Set an existing API token for the session.

**Input:**
```json
{
  "access_token": "your-existing-token",
  "user_id": "optional-user-id"
}
```

**Output:**
```json
{
  "ok": true,
  "user_id": "resolved-user-id"
}
```

## Authentication Flow

1. **First Tool Call**: When you call any tool (e.g., `list_items`) without authentication:
   ```
   Error: Authentication required. Please use the authenticate_user tool to sign in, then your request will be automatically retried.
   ```

2. **Authentication**: Use `authenticate_user` with your credentials:
   ```json
   {
     "username": "myuser",
     "password": "mypassword"
   }
   ```

3. **Automatic Retry**: The system automatically retries your original request and returns both the authentication result and your original data.

## Security Features

- **No Token Logging**: Usernames, passwords, and tokens are never logged
- **Session Management**: Tokens are stored in memory only for the MCP session duration
- **Token Validation**: All tokens are validated before use
- **Error Handling**: Clear error messages without exposing sensitive information

## Troubleshooting

### Connection Issues
```
Cannot connect to Jellyfin server at http://...
```
- Verify the `JELLYFIN_BASE_URL` is correct and accessible
- Check that Jellyfin server is running
- Ensure firewall/network settings allow access

### Authentication Failures
```
Invalid username or password
```
- Verify your Jellyfin credentials are correct
- Check that the user account is enabled
- Ensure the user has permission to sign in

### Token Issues
```
Invalid or expired token
```
- Re-authenticate using `authenticate_user`
- Check that the API token hasn't been revoked in Jellyfin

## Migration from Old Configuration

If you're currently using the environment variable method, you can:

1. **Keep existing setup**: No changes needed, it will continue to work
2. **Migrate to simplified**: Remove `JELLYFIN_USER_ID` and `JELLYFIN_TOKEN` from your config and use interactive authentication
3. **Hybrid approach**: Keep tokens as fallback, use interactive when tokens expire

## Testing Authentication

Test your authentication setup:

```bash
npm run test:auth
```

This will verify:
- Environment variable authentication (if configured)
- Interactive authentication prompts
- Session management
- Pending request handling