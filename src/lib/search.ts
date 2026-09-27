/** Lowercases and removes accents, so that « maelle » finds « Maëlle ». */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export interface Searchable {
  text: string;
  kind: string;
}

/**
 * Items whose text contains every word of the query, accents and case
 * ignored. Matches at the start of a word come first.
 */
export function search<T extends Searchable>(items: readonly T[], query: string, limit = 5): T[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored = items
    .map((item, index) => {
      const haystack = fold(item.text);
      if (!words.every((word) => haystack.includes(word))) return null;
      const atWordStart = words.filter((word) =>
        new RegExp(`(^|[^\\p{L}])${escape(word)}`, "u").test(haystack),
      ).length;
      return { item, index, score: atWordStart * 10 - haystack.length / 100 };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.item);
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
