#!/usr/bin/env tsx

import "dotenv/config";
import { AuthenticationManager } from "./auth.js";

/**
 * Test authentication system functionality
 */
async function testAuthentication() {
  console.log("🔐 Testing Jellyfin MCP Authentication System");
  console.log("=============================================\n");

  const baseUrl = process.env.JELLYFIN_BASE_URL;
  if (!baseUrl) {
    console.error("❌ JELLYFIN_BASE_URL environment variable is required");
    process.exit(1);
  }

  try {
    const authManager = new AuthenticationManager(baseUrl);

    console.log("📡 Testing authentication manager...");
    console.log(`   Server URL: ${baseUrl}`);

    // Test 1: Check environment variable authentication
    console.log("\n🧪 Test 1: Environment Variable Authentication");
    if (process.env.JELLYFIN_TOKEN && process.env.JELLYFIN_USER_ID) {
      console.log("   Environment credentials found, testing...");
      try {
        const envSession = await authManager.getAuthentication();
        console.log("✅ Environment authentication successful!");
        console.log(`   User ID: ${envSession.userId}`);
        console.log(`   Token: ${envSession.accessToken.substring(0, 8)}...`);
      } catch (error) {
        console.log("⚠️  Environment authentication failed:", error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log("   No environment credentials found (this is expected for new setup)");
    }

    // Test 2: Interactive authentication prompt
    console.log("\n🧪 Test 2: Interactive Authentication");
    console.log("   Clearing any existing session...");
    authManager.clearSession();

    try {
      await authManager.getAuthentication();
      console.log("⚠️  Expected authentication required error, but got session");
    } catch (error) {
      if (error instanceof Error && error.name === "AuthenticationRequiredError") {
        console.log("✅ Authentication required error thrown correctly");
        console.log(`   Message: ${error.message}`);
      } else {
        console.log("❌ Unexpected error:", error instanceof Error ? error.message : String(error));
      }
    }

    // Test 3: Session info
    console.log("\n🧪 Test 3: Session Information");
    const sessionInfo = authManager.getSessionInfo();
    console.log("   Session info:", JSON.stringify(sessionInfo, null, 2));

    // Test 4: Pending request functionality
    console.log("\n🧪 Test 4: Pending Request Management");
    authManager.storePendingRequest("list_items", { limit: 10 });
    const pendingRequest = authManager.getPendingRequest();
    if (pendingRequest) {
      console.log("✅ Pending request stored and retrieved successfully");
      console.log(`   Tool: ${pendingRequest.toolName}`);
      console.log(`   Args: ${JSON.stringify(pendingRequest.arguments)}`);
    } else {
      console.log("❌ Failed to store/retrieve pending request");
    }

    console.log("\n🎉 Authentication system tests completed!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Use authenticate_user tool with your Jellyfin credentials");
    console.log("   2. Or use set_token tool with an existing API token");
    console.log("   3. Then try using other MCP tools like list_items");

  } catch (error: any) {
    console.error("❌ Authentication test failed");

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("\n🔧 Connection Error:");
      console.error("   Cannot connect to Jellyfin server");
      console.error("   Check that JELLYFIN_BASE_URL is correct and server is running");
      console.error("   Current URL:", baseUrl);
    } else {
      console.error("\n📋 Error Details:", error.message);
    }

    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Verify Jellyfin server is running and accessible");
    console.error("   2. Check firewall and network settings");
    console.error("   3. Ensure JELLYFIN_BASE_URL includes protocol (http:// or https://)");

    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthentication().catch(console.error);
}

export { testAuthentication };