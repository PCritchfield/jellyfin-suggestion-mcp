import type { JellyfinClient } from "./jellyfin.ts";

export async function getLibrarySnapshot(jf: JellyfinClient) {
  // Cheap: recent additions + top genres.
  const recent = await jf.listItems({ SortBy: "DateCreated", SortOrder: "Descending", Limit: 30, Recursive: true });
  const genres: Record<string, number> = {};
  for (const i of recent.Items ?? []) for (const g of i.Genres ?? []) genres[g] = (genres[g] ?? 0) + 1;
  const counts = { movies: 0, series: 0, episodes: 0, music: 0 };
  for (const i of recent.Items ?? []) {
    if (i.Type === "Movie") counts.movies++;
    else if (i.Type === "Series") counts.series++;
    else if (i.Type === "Episode") counts.episodes++;
    else if (i.Type === "Audio" || i.Type === "MusicVideo") counts.music++;
  }
  return {
    summary: `Recent additions: ${recent.Items?.length ?? 0}`,
    counts,
    top_genres: Object.entries(genres).sort((a,b)=>b[1]-a[1]).slice(0,10)
  };
}
