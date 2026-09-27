/** Narrow no-break space, used before ? ! ; and inside « ». */
const NNBSP = " ";
/** No-break space, used before a colon. */
const NBSP = " ";

/**
 * Applies French typography to plain text written with ordinary spaces and
 * straight apostrophes, so that the copy stays easy to edit by hand:
 * `l'idée ?` becomes `l’idée ?` with a narrow no-break space.
 */
export function typo(text: string): string {
  return text
    .replace(/'/g, "’")
    .replace(/ ([?!;])/g, `${NNBSP}$1`)
    .replace(/ :/g, `${NBSP}:`)
    .replace(/« /g, `«${NNBSP}`)
    .replace(/ »/g, `${NNBSP}»`);
}

/** Replaces `{name}` placeholders with the given values. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** French plural: 0 and 1 are singular. */
export function plural(count: number, forms: { one: string; other: string }): string {
  return format(count <= 1 ? forms.one : forms.other, { count });
}
