# Security Best Practices

> 📖 **See also:** [`README.md`](./README.md) for project overview | [`SETUP.md`](./SETUP.md) for setup instructions

## 🔒 Credential Management

Your Jellyfin credentials should **never** be committed to version control or shared publicly.

## ✅ Secure Configuration Options

### Option 1: Environment Variables (Recommended)
Set credentials in your shell environment:

```bash
# Add to your ~/.bashrc, ~/.zshrc, or ~/.profile
export JELLYFIN_BASE_URL="http://your-jellyfin-server:8096"
export JELLYFIN_USER_ID="your-user-id-here"
export JELLYFIN_TOKEN="your-api-token-here"
```

Then use a clean Claude Desktop config without embedded credentials:
```json
{
  "mcpServers": {
    "jellyfin": {
      "command": "node",
      "args": ["--import", "tsx/esm", "/path/to/project/src/index.ts"],
      "cwd": "/path/to/project"
    }
  }
}
```

### Option 2: Local Configuration File
Keep credentials in a local-only config file:

```bash
# Rename your current config to prevent accidental commits
mv claude_desktop_config.json claude_desktop_config.local.json

# Use the example template for sharing
cp claude_desktop_config.example.json claude_desktop_config.json
```

### Option 3: Separate Credentials File
Create a gitignored credentials file:

```bash
echo '{
  "JELLYFIN_BASE_URL": "http://your-jellyfin-server:8096",
  "JELLYFIN_USER_ID": "your-user-id-here",
  "JELLYFIN_TOKEN": "your-api-token-here"
}' > .credentials.json
```

## 🛡️ Security Measures

- **✅ Gitignore Protection**: Sensitive config files are excluded from version control
- **✅ Example Templates**: Placeholder configs provided for safe sharing
- **✅ Environment Variable Support**: Server reads from `process.env`

## 🚨 Security Considerations

- **Jellyfin API tokens** have broad access to your media server
- **Network exposure** if Jellyfin is accessible outside your local network
- **Credential storage** in Claude Desktop config files

## 📋 Security Checklist

- [ ] Choose a secure credential management approach
- [ ] Remove any hardcoded credentials from config files
- [ ] Consider rotating your Jellyfin API token periodically
- [ ] Verify your chosen approach works before committing changes
- [ ] Review Jellyfin user permissions (consider a dedicated read-only user)

## 🔄 Token Rotation

To generate a new Jellyfin API token:
1. Go to Jellyfin Dashboard → API Keys
2. Delete the old token
3. Create a new token
4. Update your secure configuration

## 📝 Important Notes

- **Claude Desktop limitation**: `.env` files are not automatically loaded
- **Environment variables**: Most secure for local development
- **Production deployments**: Use proper secrets management systems
- **Token scope**: Consider creating a dedicated Jellyfin user with minimal permissions