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

### 1. Install & Configure
```bash
git clone <your-repo-url>
cd jellyfin-mcp
npm install
cp .env.example .env
```

### 2. Get Your Jellyfin User ID
```bash
npm run get-users
```
Copy the ID for your user and update `.env`:
```bash
JELLYFIN_BASE_URL=http://your-jellyfin-server:8096
JELLYFIN_USER_ID=your-user-id-guid-here
JELLYFIN_TOKEN=your-api-token-here
```

### 3. Test Connection
```bash
npm run test:connection
```

### 4. Start Server
```bash
npm run dev
```

### 5. Connect Claude Desktop
See [`SETUP.md`](./SETUP.md) for detailed Claude Desktop configuration instructions.

## Available Tools

- **📚 Library Snapshot** - Quick overview of your collection
- **🔍 Search Items** - Text and filter-based search
- **📋 List Items** - Browse by category with filters
- **📺 Next Up** - Continue watching TV shows
- **🎯 Recommend Similar** - AI-powered recommendations
- **🎬 Stream Info** - Playback capability information

## Development

### Testing
```bash
npm test              # Run spec tests
npm run test:connection  # Test Jellyfin connection
npm run get-users     # List Jellyfin users
```

### Building
```bash
npm run build         # Compile TypeScript
npm start            # Run compiled version
```
