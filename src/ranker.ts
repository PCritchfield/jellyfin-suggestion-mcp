export interface RankableItem {
  Id: string;
  Name: string;
  Overview?: string;
  Genres?: string[];
  ProductionYear?: number;
  People?: { Name: string; Type?: string }[];
}

export interface Recommendation {
  itemId: string;
  score: number;
  why: string[];
}

export function simpleRank(
  candidates: RankableItem[],
  opts: { seed?: RankableItem | undefined; mood?: string | undefined }
): Recommendation[] {
  const seed = opts.seed;
  const moodTokens = (opts.mood ?? "").toLowerCase().split(/\W+/).filter(Boolean);

  return candidates
    .map(c => {
      let score = 0;
      const why: string[] = [];
      if (seed) {
        const sharedGenres = intersect(seed.Genres ?? [], c.Genres ?? []);
        if (sharedGenres.length) { score += 2 * sharedGenres.length; why.push(`genres: ${sharedGenres.join(", ")}`); }
        const sharedPeople = intersect(
          (seed.People ?? []).map(p => p.Name),
          (c.People ?? []).map(p => p.Name)
        );
        if (sharedPeople.length) { score += 3 * sharedPeople.length; why.push(`people: ${sharedPeople.join(", ")}`); }
        if (seed.ProductionYear && c.ProductionYear) {
          const delta = Math.abs(seed.ProductionYear - c.ProductionYear);
          const bump = Math.max(0, 5 - Math.min(delta, 5));
          score += bump;
          if (bump) why.push("similar era");
        }
      }
      if (moodTokens.length) {
        const text = `${c.Name} ${(c.Overview ?? "").toLowerCase()} ${(c.Genres ?? []).join(" ").toLowerCase()}`;
        const hits = moodTokens.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
        if (hits) { score += hits; why.push(`mood matches (${hits})`); }
      }
      return { itemId: c.Id, score, why };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
}

function intersect<T>(a: T[], b: T[]) { const set = new Set(a); return b.filter(x => set.has(x)); }
