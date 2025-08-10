# Security Best Practices for Jellyfin MCP Server

## 🔒 Protecting Sensitive Credentials

Your `.kilocode/mcp.json` file contains sensitive credentials that should **never** be committed to version control.

## ✅ Recommended Approaches

### Option 1: Environment Variables (Recommended)
The MCP server already supports reading from environment variables. Set these in your shell:

```bash
# Add to your ~/.bashrc, ~/.zshrc, or ~/.profile
export JELLYFIN_BASE_URL="http://10.0.1.21:28096"
export JELLYFIN_USER_ID= "your-user-id-here",
export JELLYFIN_TOKEN="your-api-token-here"
```

Then simplify your `.kilocode/mcp.json`:
```json
{
  "mcpServers": {
    "jellyfin": {
      "command": "node",
      "args": ["--import", "tsx/esm", "/home/critc/projects/github.com/PCritchfield/jellyfin-suggestion-mcp/src/index.ts"],
      "cwd": "/home/critc/projects/github.com/PCritchfield/jellyfin-suggestion-mcp"
    }
  }
}
```

### Option 2: Local Configuration File
Keep your current setup but rename the file:

```bash
# Rename your current config
mv .kilocode/mcp.json .kilocode/mcp.local.json

# Copy the example for others
cp .kilocode/mcp.example.json .kilocode/mcp.json
```

### Option 3: Separate Credentials File
Create a separate credentials file:

```bash
# Create credentials file (gitignored)
echo '{
  "JELLYFIN_BASE_URL": "http://your-jellyfin-server:8096",
  "JELLYFIN_USER_ID": "your-user-id-here",
  "JELLYFIN_TOKEN": "your-api-token-here"
}' > .kilocode/credentials.json
```

## 🛡️ Security Measures Implemented

1. **✅ `.gitignore` Updated**: Added `.kilocode/mcp.json` and `.kilocode/mcp.local.json`
2. **✅ Example Template**: Created `.kilocode/mcp.example.json` with placeholder values
3. **✅ Environment Variable Support**: MCP server reads from `process.env`

## 🚨 Current Security Issues

- **HIGH**: Your current `.kilocode/mcp.json` contains real credentials
- **MEDIUM**: Jellyfin token has admin-level access to your media server

## 📋 Action Items

1. **Immediately**: Choose one of the secure approaches above
2. **Remove sensitive data** from the current `mcp.json` file
3. **Consider rotating** your Jellyfin API token for extra security
4. **Test** that the MCP server still works with your chosen approach

## 🔄 Token Rotation

To generate a new Jellyfin API token:
1. Go to Jellyfin Dashboard → API Keys
2. Delete the old token
3. Create a new token
4. Update your secure configuration

## 📝 Notes

- The `.env` file approach won't work here since Claude Desktop doesn't load `.env` files
- Environment variables are the most secure for local development
- For production deployments, consider using a secrets management system