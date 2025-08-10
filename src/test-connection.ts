#!/usr/bin/env tsx

import "dotenv/config";
import { JellyfinClient } from "./jellyfin.ts";
import { getLibrarySnapshot } from "./resources.ts";

/**
 * Test connection to Jellyfin and basic functionality
 */
async function testConnection() {
  console.log("🔌 Testing Jellyfin MCP Server Connection");
  console.log("=========================================\n");

  try {
    // Initialize Jellyfin client
    const jellyfinClient = new JellyfinClient({
      baseUrl: process.env.JELLYFIN_BASE_URL!,
      userId: process.env.JELLYFIN_USER_ID!,
      token: process.env.JELLYFIN_TOKEN!,
    });

    console.log("📡 Testing Jellyfin connection...");
    
    // Test basic connection with a simple API call
    console.log(`   Connecting to: ${process.env.JELLYFIN_BASE_URL}`);
    console.log(`   User ID: "${process.env.JELLYFIN_USER_ID}"`);
    console.log(`   Token: ${process.env.JELLYFIN_TOKEN?.substring(0, 8)}...`);
    
    const testResponse = await jellyfinClient.listItems({
      Limit: 1,
      Recursive: true,
    });
    
    console.log("✅ Jellyfin connection successful!");
    console.log(`   Found ${testResponse.TotalRecordCount || 0} total items in library`);
    
    // Test library snapshot
    console.log("\n📊 Testing library snapshot...");
    const snapshot = await getLibrarySnapshot(jellyfinClient);
    console.log("✅ Library snapshot generated successfully!");
    console.log(`   ${snapshot.summary}`);
    console.log(`   Content breakdown:`, snapshot.counts);
    console.log(`   Top genres:`, snapshot.top_genres.slice(0, 3).map(([genre, count]) => `${genre} (${count})`).join(", "));
    
    // Test each tool endpoint
    console.log("\n🔧 Testing tool endpoints...");
    
    // Test list_items
    console.log("  Testing list_items...");
    const listResponse = await jellyfinClient.listItems({
      Limit: 5,
      Recursive: true,
      IncludeItemTypes: "Movie",
    });
    console.log(`  ✅ list_items: Found ${listResponse.Items?.length || 0} movies`);
    
    // Test search_hints
    console.log("  Testing search_items...");
    const searchResponse = await jellyfinClient.searchHints("the", 3);
    console.log(`  ✅ search_items: Found ${searchResponse.SearchHints?.length || 0} search results`);
    
    // Test next_up
    console.log("  Testing next_up...");
    const nextUpResponse = await jellyfinClient.nextUp(undefined, 3);
    console.log(`  ✅ next_up: Found ${nextUpResponse.Items?.length || 0} next up items`);
    
    console.log("\n🎉 All connection tests passed!");
    console.log("\n🚀 Your MCP server is ready to start!");
    console.log("   Run: npm run dev");
    
  } catch (error: any) {
    console.error("❌ Connection test failed");
    
    if (error.response?.data) {
      console.error("\n📋 Jellyfin API Error Details:");
      console.error("   Status:", error.response.status, error.response.statusText);
      console.error("   Error Data:", JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.config) {
      console.error("\n🔍 Request Details:");
      console.error("   URL:", error.config.baseURL + error.config.url);
      console.error("   Method:", error.config.method?.toUpperCase());
      console.error("   Params:", JSON.stringify(error.config.params, null, 2));
    }
    
    console.error("\n🔧 Troubleshooting Steps:");
    console.error("   1. Verify JELLYFIN_BASE_URL is correct and accessible");
    console.error("   2. Check that JELLYFIN_USER_ID is the exact user ID (not username)");
    console.error("   3. Ensure JELLYFIN_TOKEN is a valid API key for this user");
    console.error("   4. Try accessing the URL manually: " + process.env.JELLYFIN_BASE_URL + "/web");
    
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection().catch(console.error);
}

export { testConnection };