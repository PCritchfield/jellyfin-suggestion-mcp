# Jellyfin MCP Server Setup Guide

This guide will help you run the Jellyfin MCP server and connect Claude Desktop to it.

## Prerequisites

✅ **Already completed:**
- Node.js v20+ installed
- Jellyfin server running and accessible
- Project dependencies installed (`npm install`)

## Step 1: Configure Environment

1. **Update your `.env` file** with the correct user ID:
   ```bash
   JELLYFIN_BASE_URL=http://10.0.1.21:28096
   JELLYFIN_USER_ID= "your-user-id-here",
   JELLYFIN_TOKEN="your-api-token-here"
   ```

2. **Test the connection:**
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

### Option A: Using Claude Desktop App

1. **Install Claude Desktop** from https://claude.ai/download if you haven't already

2. **Open Claude Desktop settings:**
   - On macOS: `Claude Desktop` → `Settings` → `Developer`
   - On Windows: Click the gear icon → `Developer`

3. **Add MCP server configuration** to the `claude_desktop_config.json` file:

   **macOS location:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows location:** `%APPDATA%\Claude\claude_desktop_config.json`

   Add this configuration:
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
           "JELLYFIN_BASE_URL": "http://10.0.1.21:28096",
           "JELLYFIN_USER_ID": "your-user-id-here",
           "JELLYFIN_TOKEN": "your-api-token-here"
         }
       }
     }
   }
   ```

   **Replace `/full/path/to/your/project`** with your actual project path (e.g., `/home/critc/projects/github.com/PCritchfield/jellyfin-suggestion-mcp`)

4. **Restart Claude Desktop** completely (quit and reopen)

5. **Verify connection:** In a new Claude conversation, you should see a small "🔧" icon indicating MCP tools are available

### Option B: Using Claude Web (Alternative)

If you prefer to use Claude in the browser, you can set up a local MCP proxy, but the Desktop app is recommended for the best experience.

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

## Available Tools

Claude will have access to these tools from your Jellyfin library:

- **📚 Library Snapshot** - Quick overview of your collection
- **🔍 Search Items** - Text and filter-based search
- **📋 List Items** - Browse by category with filters
- **📺 Next Up** - Continue watching TV shows
- **🎯 Recommend Similar** - AI-powered recommendations
- **🎬 Stream Info** - Playback capability information

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