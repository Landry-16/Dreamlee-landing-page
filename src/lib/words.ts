/** Counts words like the Dreamlee editor: tokens holding a letter or digit. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Formats a number the French way: 1 248, 84 312. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value).replace(/[\u202F\u00A0]/g, "\u202F");
}
