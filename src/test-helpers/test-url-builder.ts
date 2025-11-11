#!/usr/bin/env node
/**
 * Test helper: URL Builder
 * 
 * Standalone script that builds a Jellyfin URL from environment variables.
 * Used by tests to validate URL construction logic in isolation.
 * 
 * Usage:
 *   JELLYFIN_BASE_URL=example.com JELLYFIN_PROTOCOL=https node url-builder.js
 * 
 * Output:
 *   Prints the constructed URL to stdout
 *   Exits with code 1 and error message to stderr on failure
 */

/**
 * Get optional environment variable
 */
function getEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get required environment variable or throw error
 */
function mustEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Build Jellyfin URL with protocol configuration support
 * 
 * Logic:
 * 1. If base URL already has protocol (http:// or https://), use it as-is
 * 2. If JELLYFIN_PROTOCOL is set, validate and use it
 * 3. Otherwise, default to HTTPS for security
 */
function buildJellyfinUrl(): string {
  const rawBaseUrl = mustEnv("JELLYFIN_BASE_URL");
  const protocol = getEnv("JELLYFIN_PROTOCOL");

  try {
    // Parse the base URL to check if it already has a protocol
    new URL(rawBaseUrl);

    // If base URL already has a protocol, it takes precedence
    return rawBaseUrl;
  } catch {
    // Base URL doesn't have a protocol, construct with protocol configuration
    if (protocol) {
      const normalizedProtocol = protocol.toLowerCase();

      // Validate protocol
      if (normalizedProtocol !== "http" && normalizedProtocol !== "https") {
        throw new Error(`Invalid JELLYFIN_PROTOCOL "${protocol}". Must be "http" or "https"`);
      }

      return `${normalizedProtocol}://${rawBaseUrl}`;
    }

    // No protocol specified, default to https for security
    return `https://${rawBaseUrl}`;
  }
}

// Execute when run as a script
try {
  const url = buildJellyfinUrl();
  console.log(url);
  process.exit(0);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(errorMessage);
  process.exit(1);
}
