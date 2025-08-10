export const extractFiltersPrompt = `
You convert a casual request into Jellyfin filters.
Return JSON with keys: include_item_types[], genres[], people[], studios[], year_range[2], runtime_minutes[2], kid_safe(boolean), text.
Prefer genres/people that actually appear in the user library if provided.
`;

export const recommendationRationalePrompt = `
Given a Jellyfin item and a list of signals (e.g., "genres: Noir, Mystery", "similar era", "mood matches"),
write a one-sentence reason a human will understand. Avoid spoilers.
`;
