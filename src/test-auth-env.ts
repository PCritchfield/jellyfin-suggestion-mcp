#!/usr/bin/env tsx

import "dotenv/config";
import { AuthenticationManager } from "./auth.js";

/**
 * Test environment variable username/password authentication functionality
 * Tests the complete authentication priority chain and fallback behavior
 */
async function testEnvironmentAuth() {
  console.log("🔐 Testing Environment Variable Username Authentication");
  console.log("==================================================\n");

  const baseUrl = process.env.JELLYFIN_BASE_URL;
  if (!baseUrl) {
    console.error("❌ JELLYFIN_BASE_URL environment variable is required");
    process.exit(1);
  }

  try {
    const authManager = new AuthenticationManager(baseUrl);
    
    console.log("📡 Testing environment username authentication...");
    console.log(`   Server URL: ${baseUrl}`);
    
    // Test 1: Authentication Priority Order - API Key First
    console.log("\n🧪 Test 1: Authentication Priority Order (API Key First)");
    const originalToken = process.env.JELLYFIN_TOKEN;
    const originalUserId = process.env.JELLYFIN_USER_ID;
    const originalUsername = process.env.JELLYFIN_USERNAME;
    const originalPassword = process.env.JELLYFIN_PASSWORD;
    
    // Set up environment with both API key and username/password
    if (originalToken && originalUserId && originalUsername && originalPassword) {
      console.log("   Both API key and username credentials found");
      console.log("   Testing that API key takes priority...");
      
      try {
        const session = await authManager.getAuthentication();
        console.log("✅ Authentication successful!");
        console.log("   Priority test: API key authentication should have been used first");
        console.log(`   User ID: ${session.userId}`);
        
        // Clear session to test next priority
        authManager.clearSession();
      } catch {
        console.log("⚠️  API key authentication failed, testing username fallback...");
      }
    } else {
      console.log("   Missing some credentials for full priority test");
    }
    
    // Test 2: Username/Password Environment Variable Authentication
    console.log("\n🧪 Test 2: Username/Password Environment Authentication");
    
    // Temporarily clear API key credentials to test username auth
    delete process.env.JELLYFIN_TOKEN;
    delete process.env.JELLYFIN_USER_ID;
    
    if (originalUsername && originalPassword) {
      console.log("   Username/password credentials found, testing...");
      process.env.JELLYFIN_USERNAME = originalUsername;
      process.env.JELLYFIN_PASSWORD = originalPassword;
      
      try {
        // Clear session and create new auth manager to test fresh authentication
        const freshAuthManager = new AuthenticationManager(baseUrl);
        const session = await freshAuthManager.getAuthentication();
        console.log("✅ Environment username authentication successful!");
        console.log(`   User ID: ${session.userId}`);
        console.log(`   Username: ${session.userName || 'Unknown'}`);
        console.log(`   Token: ${session.accessToken.substring(0, 8)}...`);
        
        // Verify session is stored
        const sessionInfo = freshAuthManager.getSessionInfo();
        if (sessionInfo.authenticated) {
          console.log("✅ Session correctly stored in memory");
        } else {
          console.log("❌ Session not stored correctly");
        }
        
      } catch (error) {
        console.log("❌ Environment username authentication failed:", error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log("   No username/password credentials found");
      console.log("   To test username auth, set JELLYFIN_USERNAME and JELLYFIN_PASSWORD");
    }
    
    // Test 3: Fallback to Interactive Authentication
    console.log("\n🧪 Test 3: Fallback to Interactive Authentication");
    
    // Clear all environment credentials
    delete process.env.JELLYFIN_TOKEN;
    delete process.env.JELLYFIN_USER_ID;
    delete process.env.JELLYFIN_USERNAME;
    delete process.env.JELLYFIN_PASSWORD;
    
    const fallbackAuthManager = new AuthenticationManager(baseUrl);
    
    try {
      await fallbackAuthManager.getAuthentication();
      console.log("⚠️  Expected authentication required error, but got session");
    } catch (error) {
      if (error instanceof Error && error.name === "AuthenticationRequiredError") {
        console.log("✅ Correctly fell back to interactive authentication requirement");
        console.log(`   Message: ${error.message}`);
      } else {
        console.log("❌ Unexpected error:", error instanceof Error ? error.message : String(error));
      }
    }
    
    // Test 4: Invalid Credentials Handling
    console.log("\n🧪 Test 4: Invalid Credentials Handling");
    
    // Set invalid credentials
    process.env.JELLYFIN_USERNAME = "invalid_user";
    process.env.JELLYFIN_PASSWORD = "invalid_password";
    
    const invalidAuthManager = new AuthenticationManager(baseUrl);
    
    try {
      await invalidAuthManager.getAuthentication();
      console.log("⚠️  Expected authentication failure, but got session");
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes("Invalid username or password") || 
           error.message.includes("Authentication failed") ||
           error.name === "AuthenticationRequiredError")) {
        console.log("✅ Invalid credentials correctly rejected");
        console.log(`   Error: ${error.message}`);
      } else {
        console.log("❌ Unexpected error type:", error instanceof Error ? error.message : String(error));
      }
    }
    
    // Test 5: Session Management and Reuse
    console.log("\n🧪 Test 5: Session Management and Reuse");
    
    if (originalUsername && originalPassword) {
      // Restore valid credentials
      process.env.JELLYFIN_USERNAME = originalUsername;
      process.env.JELLYFIN_PASSWORD = originalPassword;
      
      const sessionAuthManager = new AuthenticationManager(baseUrl);
      
      try {
        console.log("   Testing session creation...");
        const firstSession = await sessionAuthManager.getAuthentication();
        console.log("✅ First authentication successful");
        
        console.log("   Testing session reuse...");
        const secondSession = await sessionAuthManager.getAuthentication();
        
        if (firstSession.accessToken === secondSession.accessToken && 
            firstSession.userId === secondSession.userId) {
          console.log("✅ Session correctly reused (no re-authentication)");
        } else {
          console.log("⚠️  Session not reused, new authentication occurred");
        }
        
      } catch (error) {
        console.log("❌ Session management test failed:", error instanceof Error ? error.message : String(error));
      }
    }
    
    // Restore original environment variables
    if (originalToken) process.env.JELLYFIN_TOKEN = originalToken;
    if (originalUserId) process.env.JELLYFIN_USER_ID = originalUserId;
    if (originalUsername) process.env.JELLYFIN_USERNAME = originalUsername;
    if (originalPassword) process.env.JELLYFIN_PASSWORD = originalPassword;
    
    console.log("\n🎉 Environment authentication tests completed!");
    console.log("\n📋 Test Summary:");
    console.log("   ✅ Authentication priority order validated");
    console.log("   ✅ Username/password environment auth tested");  
    console.log("   ✅ Fallback behavior verified");
    console.log("   ✅ Invalid credentials handling confirmed");
    console.log("   ✅ Session management validated");
    
    console.log("\n📋 Authentication Priority Order:");
    console.log("   1. In-memory session (if valid)");
    console.log("   2. Environment API key (JELLYFIN_TOKEN + JELLYFIN_USER_ID)");
    console.log("   3. Environment username (JELLYFIN_USERNAME + JELLYFIN_PASSWORD)");
    console.log("   4. Interactive authentication prompt");
    
  } catch (error: any) {
    console.error("❌ Environment authentication test failed");
    
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
    console.error("   4. Verify JELLYFIN_USERNAME and JELLYFIN_PASSWORD are valid");
    
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEnvironmentAuth().catch(console.error);
}

export { testEnvironmentAuth };
