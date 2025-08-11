# Jellyfin MCP Server Setup Guide

Complete step-by-step guide to set up and connect the Jellyfin MCP server with Claude Desktop.

> 📖 **See also:** [`README.md`](./README.md) for project overview | [`SECURITY.md`](./SECURITY.md) for security best practices

## Prerequisites

- Node.js v20+ installed
- Jellyfin server running and accessible
- Claude Desktop app installed

## Step 1: Install & Configure

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd jellyfin-mcp
   npm install
   ```

2. **Get your Jellyfin User ID:**
   ```bash
   npm run get-users
   ```
   Copy the ID for your user from the output.

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your details:
   ```bash
   JELLYFIN_BASE_URL=http://your-jellyfin-server:8096
   JELLYFIN_USER_ID=your-user-id-guid-here
   JELLYFIN_TOKEN=your-api-token-here
   ```

4. **Test the connection:**
   ```bash
   npm run test:connection
   ```
   
   You should see:
   ```
   ✅ Jellyfin connection successful!
   ✅ Library snapshot generated successfully!
   ✅ All connection tests passed!
   ```

## Step 2: Start the MCP Server

Run the server in development mode:
```bash
npm run dev
```

The server will start and display:
```
Jellyfin MCP Server running on stdio
```

**Keep this terminal open** - the server needs to stay running for Claude to connect to it.

## Step 3: Configure Claude Desktop

1. **Open Claude Desktop settings:**
   - On macOS: `Claude Desktop` → `Settings` → `Developer`
   - On Windows: Click the gear icon → `Developer`

2. **Edit the configuration file:**
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

3. **Add the MCP server configuration:**
   ```json
   {
     "mcpServers": {
       "jellyfin": {
         "command": "node",
         "args": [
           "--import",
           "tsx/esm",
           "/full/path/to/your/project/src/index.ts"
         ],
         "cwd": "/full/path/to/your/project",
         "env": {
           "JELLYFIN_BASE_URL": "http://your-jellyfin-server:8096",
           "JELLYFIN_USER_ID": "your-user-id-here",
           "JELLYFIN_TOKEN": "your-api-token-here"
         }
       }
     }
   }
   ```

   > **Important:** Replace `/full/path/to/your/project` with your actual project path
   >
   > **Security:** See [`SECURITY.md`](./SECURITY.md) for secure credential management options

4. **Restart Claude Desktop** completely (quit and reopen)

5. **Verify connection:** Look for the "🔧" icon in Claude conversations indicating MCP tools are available

## Step 4: Test the Integration

Once connected, try these example prompts with Claude:

### Basic Library Exploration
```
"What's in my Jellyfin library? Give me a snapshot of what I have."
```

### Movie Recommendations
```
"Find me some good 90s comedies under 2 hours that I can watch tonight."
```

### TV Show Continuation
```
"What should I watch next? Show me my next up episodes."
```

### Mood-Based Recommendations
```
"I'm in the mood for something dark and funny. What do you recommend from my library?"
```

### Specific Searches
```
"Find movies with Tom Hanks from the 1990s in my collection."
```


## Troubleshooting

### Server Won't Start
```bash
# Check for TypeScript errors
npm run build

# Test connection to Jellyfin
npm run test:connection
```

### Claude Can't Connect
1. **Check the server is running** (`npm run dev`)
2. **Verify file paths** in `claude_desktop_config.json` are absolute and correct
3. **Restart Claude Desktop** completely
4. **Check Claude Desktop logs** (usually in the same directory as the config file)

### Permission Issues
```bash
# Make sure the project directory is readable
chmod -R 755 /path/to/your/project

# Check environment variables are set
cat .env
```

### Connection Errors
```bash
# Test Jellyfin connection manually
curl -H "X-MediaBrowser-Token: YOUR_TOKEN" \
     "http://your-jellyfin-url:port/Users/YOUR_USER_ID/Items?Limit=1"
```

## Success! 🎉

When everything is working, you'll be able to have natural conversations with Claude about your media library:

- **"What comedies do I have from the 80s?"**
- **"Find me something to watch based on The Office"**
- **"What's new in my library this week?"**
- **"I want to continue watching my shows"**

Claude will understand your requests and search your actual Jellyfin library to provide personalized recommendations!