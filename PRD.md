# Product Requirements Document — Jellyfin MCP Recommendation Server

## Background
Jellyfin is a self-hosted media server that stores and streams a user’s personal media library.
Current Jellyfin clients are human-driven — a user searches, browses, and filters manually.

This project adds a **Model Context Protocol (MCP) server** that exposes Jellyfin’s library context, search capabilities, and recommendation logic to an LLM or agentic client.

**Goal:** Let an AI assistant hold a natural conversation with the user and surface relevant, playable media based on mood, history, and preferences.

---

## Goals
- **Conversational Discovery**: Enable an LLM to interpret a user request and translate it into Jellyfin filters.
- **Structured Access**: Expose read-only library resources, search tools, and recommendation tools over MCP.
- **Personalization**: Incorporate watch history and “Next Up” data into recommendations.
- **Low-Token Overhead**: Allow AI clients to fetch only needed spec slices/resources.
- **Extensibility**: Support future ranking improvements (e.g., embeddings) without breaking the contract.

---

## Non-Goals
- Write operations to the Jellyfin library.
- Direct playback control in v1 (may be added later with explicit confirmation).
- Replacing the Jellyfin UI.

---

## User Stories
1. **Filtering**  
   As a user, I can say “Find me family movies from the 80s” and the AI uses `search_items` with filters.
2. **Continuation**  
   As a user, I can say “What should I watch next?” and the AI calls `next_up` to suggest my next episode.
3. **Similar Titles**  
   As a user, I can say “More like Grosse Pointe Blank” and the AI calls `recommend_similar` to find similar items with reasons.
4. **Cold Start**  
   As a user, I can ask “What’s new?” and the AI reads `jellyfin://snapshot` to summarize recent additions and top genres.

---

## Constraints
- MCP 1.2+, Jellyfin 10.8+, token auth per user.
- Redact file paths and stream URLs by default.
- Kid-mode policy respected when enabled.
- Response time: < 2s for ≤ 24 items on ≤ 20k-item library.
- All spec acceptance tests must pass before deployment.

---

## Success Metrics
- 100% of `tests:` in the spec pass in CI.
- LLM-driven media requests return valid items 95% of the time in user testing.
- Kid-mode and result caps enforced in 100% of relevant calls.
- No breaking changes without a major version bump.

---

## Deliverables
- `jellyfin-mcp.spec.yaml` — machine-readable spec served as MCP resource.
- MCP server implementation in TypeScript matching the spec.
- Test harness to run spec acceptance tests against the MCP server.
- Developer guide for connecting an LLM client to the MCP.
