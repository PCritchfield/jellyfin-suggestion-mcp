#!/usr/bin/env tsx

import "dotenv/config";
import axios from "axios";

/**
 * Helper script to fetch all Jellyfin users and their IDs
 * Useful for finding the correct user ID for your .env file
 */
async function getUsers() {
  console.log("👥 Fetching Jellyfin Users");
  console.log("=========================\n");

  try {
    const baseUrl = process.env.JELLYFIN_BASE_URL;
    const token = process.env.JELLYFIN_TOKEN;

    if (!baseUrl || !token) {
      console.error("❌ Missing JELLYFIN_BASE_URL or JELLYFIN_TOKEN in .env file");
      process.exit(1);
    }

    console.log(`📡 Connecting to: ${baseUrl}`);
    console.log(`🔑 Using token: ${token.substring(0, 8)}...\n`);

    // Fetch all users (admin endpoint)
    const response = await axios.get(`${baseUrl}/Users`, {
      headers: {
        "X-MediaBrowser-Token": token,
      },
    });

    const users = response.data;

    if (!users || users.length === 0) {
      console.log("⚠️  No users found");
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);

    users.forEach((user: Record<string, unknown>, index: number) => {
      const policy = user.Policy as Record<string, unknown> | undefined;
      console.log(`${index + 1}. ${user.Name}`);
      console.log(`   ID: ${user.Id}`);
      console.log(`   Admin: ${policy?.IsAdministrator ? 'Yes' : 'No'}`);
      console.log(`   Disabled: ${policy?.IsDisabled ? 'Yes' : 'No'}`);
      console.log("");
    });

    console.log("💡 Copy the ID of your user and update JELLYFIN_USER_ID in your .env file");

  } catch (error: unknown) {
    console.error("❌ Failed to fetch users");

    const axiosError = error as { response?: { status?: number; statusText?: string }; message?: string };
    if (axiosError.response?.status === 401) {
      console.error("   Authentication failed - check your JELLYFIN_TOKEN");
    } else if (axiosError.response?.status === 403) {
      console.error("   Access denied - your token may not have admin privileges");
    } else if (axiosError.response) {
      console.error(`   HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`);
    } else {
      console.error(`   ${axiosError.message || String(error)}`);
    }

    console.error("\n🔧 Make sure:");
    console.error("   1. JELLYFIN_BASE_URL is correct");
    console.error("   2. JELLYFIN_TOKEN is valid and has admin privileges");
    console.error("   3. Jellyfin server is running and accessible");

    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  getUsers().catch(console.error);
}

export { getUsers };