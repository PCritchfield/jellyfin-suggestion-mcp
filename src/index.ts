import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Import our existing components
import { JellyfinClient } from "./jellyfin.ts";
import { loadSpec } from "./spec.ts";
import {
  ListItemsInput,
  SearchItemsInput,
  NextUpInput,
  RecommendSimilarInput,
  GetStreamInfoInput,
} from "./schema.ts";
import { simpleRank } from "./ranker.ts";
import { getLibrarySnapshot } from "./resources.ts";

// Helper function for environment variables
function mustEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Initialize Jellyfin client
const jellyfinClient = new JellyfinClient({
  baseUrl: mustEnv("JELLYFIN_BASE_URL"),
  userId: mustEnv("JELLYFIN_USER_ID"),
  token: mustEnv("JELLYFIN_TOKEN"),
});

// Load spec for tool definitions
const spec = loadSpec();

// Create MCP server
const server = new Server(
  {
    name: "jellyfin-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Register resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "jellyfin://snapshot",
        name: "Library snapshot",
        description: "Small, fast overview for conversational cold starts",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === "jellyfin://snapshot") {
    try {
      const snapshot = await getLibrarySnapshot(jellyfinClient);
      return {
        contents: [
          {
            uri: "jellyfin://snapshot",
            mimeType: "application/json",
            text: JSON.stringify(snapshot, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get library snapshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_items",
        description: "Filtered listing from the user's library",
        inputSchema: {
          type: "object",
          properties: {
            view: {
              type: "string",
              enum: ["All", "Movies", "Shows", "Episodes", "Music"],
              default: "All",
            },
            filters: {
              type: "object",
              properties: {
                include_item_types: { type: "array", items: { type: "string" } },
                genres: { type: "array", items: { type: "string" } },
                people: { type: "array", items: { type: "string" } },
                studios: { type: "array", items: { type: "string" } },
                year_range: { type: "array", items: { type: "integer" }, minItems: 2, maxItems: 2 },
                runtime_minutes: { type: "array", items: { type: "integer" }, minItems: 2, maxItems: 2 },
                kid_safe: { type: "boolean" },
                text: { type: "string" },
              },
            },
            sort: {
              type: "string",
              enum: ["Random", "CommunityRating", "PremiereDate", "PlayCount", "DateCreated"],
              default: "DateCreated",
            },
            limit: { type: "integer", minimum: 1, maximum: 200 },
            cursor: { type: "string" },
          },
          required: ["limit"],
        },
      },
      {
        name: "search_items",
        description: "Search by text and/or structured filters",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            filters: {
              type: "object",
              properties: {
                include_item_types: { type: "array", items: { type: "string" } },
                genres: { type: "array", items: { type: "string" } },
                people: { type: "array", items: { type: "string" } },
                studios: { type: "array", items: { type: "string" } },
                year_range: { type: "array", items: { type: "integer" }, minItems: 2, maxItems: 2 },
                runtime_minutes: { type: "array", items: { type: "integer" }, minItems: 2, maxItems: 2 },
                kid_safe: { type: "boolean" },
                text: { type: "string" },
              },
            },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            cursor: { type: "string" },
          },
        },
      },
      {
        name: "next_up",
        description: "Personalized continuation for TV",
        inputSchema: {
          type: "object",
          properties: {
            series_id: { type: "string" },
            limit: { type: "integer", minimum: 1, maximum: 50 },
          },
        },
      },
      {
        name: "recommend_similar",
        description: "Similar items with rationale strings",
        inputSchema: {
          type: "object",
          properties: {
            seed_item_id: { type: "string" },
            mood: { type: "string" },
            limit: { type: "integer", minimum: 1, maximum: 50 },
          },
        },
      },
      {
        name: "get_stream_info",
        description: "Playback capability data",
        inputSchema: {
          type: "object",
          properties: {
            item_id: { type: "string" },
          },
          required: ["item_id"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "list_items":
        return await handleListItems(args);
      case "search_items":
        return await handleSearchItems(args);
      case "next_up":
        return await handleNextUp(args);
      case "recommend_similar":
        return await handleRecommendSimilar(args);
      case "get_stream_info":
        return await handleGetStreamInfo(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Tool ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Tool handler implementations
async function handleListItems(args: any) {
  const input = ListItemsInput.parse(args);
  
  // Transform MCP input to Jellyfin API parameters
  const params: Record<string, any> = {
    Recursive: true,
    Limit: Math.min(input.limit, 200), // Enforce hard limit
    SortBy: mapSortToJellyfin(input.sort),
    SortOrder: "Descending",
  };
  
  // Apply view filter
  if (input.view !== "All") {
    params.IncludeItemTypes = mapViewToItemTypes(input.view);
  }
  
  // Apply filters
  if (input.filters) {
    applyFiltersToParams(params, input.filters);
  }
  
  // Apply cursor for pagination
  if (input.cursor) {
    params.StartIndex = parseInt(input.cursor, 10) || 0;
  }
  
  const response = await jellyfinClient.listItems(params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          items: response.Items || [],
          total: response.TotalRecordCount || 0,
          next_cursor: response.Items && response.Items.length === input.limit ? 
            String((params.StartIndex || 0) + input.limit) : undefined,
        }, null, 2),
      },
    ],
  };
}

async function handleSearchItems(args: any) {
  const input = SearchItemsInput.parse(args);
  
  // For search, we'll use both search hints and filtered listing
  let items: any[] = [];
  
  if (input.query) {
    const searchResponse = await jellyfinClient.searchHints(input.query, input.limit);
    items = searchResponse.SearchHints || [];
  } else {
    // If no query, fall back to filtered listing
    const params: Record<string, any> = {
      Recursive: true,
      Limit: Math.min(input.limit, 100),
    };
    
    if (input.filters) {
      applyFiltersToParams(params, input.filters);
    }
    
    const response = await jellyfinClient.listItems(params);
    items = response.Items || [];
  }
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          items: items.slice(0, input.limit),
          total: items.length,
          next_cursor: items.length > input.limit ? "next_page" : undefined,
        }, null, 2),
      },
    ],
  };
}

async function handleNextUp(args: any) {
  const input = NextUpInput.parse(args);
  
  const response = await jellyfinClient.nextUp(input.series_id, input.limit);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          items: response.Items || [],
          total: response.TotalRecordCount || 0,
        }, null, 2),
      },
    ],
  };
}

async function handleRecommendSimilar(args: any) {
  const input = RecommendSimilarInput.parse(args);
  
  let seedItem: any = null;
  if (input.seed_item_id) {
    seedItem = await jellyfinClient.item(input.seed_item_id);
  }
  
  // Get candidate items from the library
  const candidatesResponse = await jellyfinClient.listItems({
    Recursive: true,
    Limit: 200, // Get a good pool of candidates
    IncludeItemTypes: "Movie,Series",
  });
  
  const candidates = candidatesResponse.Items || [];
  
  // Use our ranking algorithm
  const recommendations = simpleRank(candidates, {
    seed: seedItem || undefined,
    mood: input.mood || undefined,
  });
  
  // Transform to expected format with rationale
  const items = recommendations.slice(0, input.limit).map(rec => {
    const item = candidates.find((c: any) => c.Id === rec.itemId);
    return {
      ...item,
      score: rec.score,
      why: rec.why,
    };
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          items,
        }, null, 2),
      },
    ],
  };
}

async function handleGetStreamInfo(args: any) {
  const input = GetStreamInfoInput.parse(args);
  
  const streamInfo = await jellyfinClient.streamInfo(input.item_id);
  
  // Extract basic playback info
  const canDirectPlay = streamInfo.MediaSources?.[0]?.SupportsDirectStream || false;
  const container = streamInfo.MediaSources?.[0]?.Container || "unknown";
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          can_direct_play: canDirectPlay,
          container,
        }, null, 2),
      },
    ],
  };
}

// Helper functions
function mapSortToJellyfin(sort: string): string {
  const mapping: Record<string, string> = {
    Random: "Random",
    CommunityRating: "CommunityRating",
    PremiereDate: "PremiereDate",
    PlayCount: "PlayCount",
    DateCreated: "DateCreated",
  };
  return mapping[sort] || "DateCreated";
}

function mapViewToItemTypes(view: string): string {
  const mapping: Record<string, string> = {
    Movies: "Movie",
    Shows: "Series",
    Episodes: "Episode",
    Music: "Audio,MusicVideo",
  };
  return mapping[view] || "";
}

function applyFiltersToParams(params: Record<string, any>, filters: any) {
  if (filters.include_item_types) {
    params.IncludeItemTypes = filters.include_item_types.join(",");
  }
  
  if (filters.genres) {
    params.Genres = filters.genres.join(",");
  }
  
  if (filters.people) {
    params.Person = filters.people.join(",");
  }
  
  if (filters.studios) {
    params.Studios = filters.studios.join(",");
  }
  
  if (filters.year_range) {
    const [minYear, maxYear] = filters.year_range;
    params.Years = `${minYear},${maxYear}`;
  }
  
  if (filters.runtime_minutes) {
    const [minRuntime, maxRuntime] = filters.runtime_minutes;
    params.MinRuntime = minRuntime;
    params.MaxRuntime = maxRuntime;
  }
  
  if (filters.kid_safe !== undefined) {
    params.MaxOfficialRating = filters.kid_safe ? "PG" : undefined;
  }
  
  if (filters.text) {
    params.SearchTerm = filters.text;
  }
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Jellyfin MCP Server running on stdio");
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
}

export { server };
