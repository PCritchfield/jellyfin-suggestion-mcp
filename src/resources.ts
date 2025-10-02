import type { JellyfinClient } from "./jellyfin.ts";

export async function getLibrarySnapshot(jf: JellyfinClient) {
  // Cheap: recent additions + top genres.
  const recent = await jf.listItems({ SortBy: "DateCreated", SortOrder: "Descending", Limit: 30, Recursive: true });
  const items = Array.isArray(recent.Items) ? recent.Items : [];
  const genres: Record<string, number> = {};
  for (const i of items) {
    const itemGenres = Array.isArray((i as Record<string, unknown>).Genres) ? (i as Record<string, unknown>).Genres as string[] : [];
    for (const g of itemGenres) genres[g] = (genres[g] ?? 0) + 1;
  }
  const counts = { movies: 0, series: 0, episodes: 0, music: 0 };
  for (const i of items) {
    const item = i as Record<string, unknown>;
    if (item.Type === "Movie") counts.movies++;
    else if (item.Type === "Series") counts.series++;
    else if (item.Type === "Episode") counts.episodes++;
    else if (item.Type === "Audio" || item.Type === "MusicVideo") counts.music++;
  }
  return {
    summary: `Recent additions: ${items.length}`,
    counts,
    top_genres: Object.entries(genres).sort((a,b)=>b[1]-a[1]).slice(0,10)
  };
}
