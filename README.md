# Jellyfin MCP Recommendation Server

## Overview
This is an MCP server that connects to a Jellyfin media server and exposes read-only tools/resources to an LLM agent for conversational media recommendations.

It implements the contract defined in [`jellyfin-mcp.spec.yaml`](./jellyfin-mcp.spec.yaml).

## Prerequisites
- Node.js v20+
- Jellyfin 10.8+ running and accessible
- A Jellyfin userId and API token

## Setup
```bash
git clone <your-repo-url>
cd jellyfin-mcp
npm install
cp .env.example .env
# edit .env with your Jellyfin credentials
