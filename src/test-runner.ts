#!/usr/bin/env tsx

import "dotenv/config";
import { SpecTestHarness } from "./test-harness.ts";

/**
 * Test runner for the Jellyfin MCP spec tests
 */
async function main() {
  console.log("🧪 Jellyfin MCP Spec Test Runner");
  console.log("================================\n");

  try {
    // Create test harness (without MCP server for now)
    const harness = new SpecTestHarness();
    
    // Show available tests
    const testCases = harness.getTestCases();
    console.log(`📋 Found ${testCases.length} test cases in spec:`);
    testCases.forEach((test, i) => {
      console.log(`  ${i + 1}. ${test.name} (${test.call})`);
    });
    
    console.log("\n⚠️  Note: MCP server not implemented yet - tests will use mock responses\n");
    
    // Run all tests
    const results = await harness.runAllTests();
    
    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log("\n" + "=".repeat(50));
    console.log(`📊 Final Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      console.log("\n❌ Failed tests:");
      results.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.name}: ${result.error}`);
        if (result.details) {
          console.log(`    Expected: ${JSON.stringify(result.details.expected)}`);
          console.log(`    Actual: ${JSON.stringify(result.details.actual)}`);
        }
      });
    }
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: tsx src/test-runner.ts [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Show verbose output
  --test <name>  Run specific test by name

Examples:
  tsx src/test-runner.ts                    # Run all tests
  tsx src/test-runner.ts --test "kid_mode"  # Run specific test
  tsx src/test-runner.ts --verbose          # Verbose output
`);
  process.exit(0);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runTests };