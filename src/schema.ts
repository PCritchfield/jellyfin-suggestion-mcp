import { z } from "zod";

export const Filters = z.object({
  include_item_types: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  people: z.array(z.string()).optional(),
  studios: z.array(z.string()).optional(),
  year_range: z.tuple([z.number(), z.number()]).optional(),
  runtime_minutes: z.tuple([z.number(), z.number()]).optional(),
  kid_safe: z.boolean().optional(),
  text: z.string().optional()
});

export const ListItemsInput = z.object({
  view: z.enum(["Movies","Shows","Episodes","Music","All"]).default("All"),
  filters: Filters.optional(),
  sort: z.enum(["Random","CommunityRating","PremiereDate","PlayCount","DateCreated"]).default("DateCreated"),
  limit: z.number().int().positive().max(200),
  cursor: z.string().optional()
});

export const SearchItemsInput = z.object({
  query: z.string().optional(),
  filters: Filters.optional(),
  limit: z.number().int().positive().max(100).default(24),
  cursor: z.string().optional()
});

export const NextUpInput = z.object({
  series_id: z.string().optional(),
  limit: z.number().int().positive().max(50).default(10)
});

export const RecommendSimilarInput = z.object({
  seed_item_id: z.string().optional(),
  mood: z.string().optional(),
  limit: z.number().int().positive().max(50).default(10)
}).refine(v => v.seed_item_id || v.mood, { message: "Provide seed_item_id or mood" });

export const GetStreamInfoInput = z.object({
  item_id: z.string()
});

export const AuthenticateUserInput = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
