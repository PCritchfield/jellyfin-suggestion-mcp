#!/usr/bin/env node

import "dotenv/config";
import { main } from "./index.js";

/**
 * CLI entry point for npx execution
 * This script is referenced in package.json bin field
 */

// Add CLI-specific initialization
console.error("🎬 Starting Jellyfin MCP Server...");

// Check for required environment variables and provide helpful messages
if (!process.env.JELLYFIN_BASE_URL) {
  console.error("⚠️  JELLYFIN_BASE_URL not configured - authentication will be required on first use");
} else {
  console.error(`📡 Connecting to Jellyfin server: ${process.env.JELLYFIN_BASE_URL}`);
}

// Start the MCP server
main().catch((error: unknown) => {
  console.error("❌ Failed to start Jellyfin MCP Server:", error);
  process.exit(1);
});