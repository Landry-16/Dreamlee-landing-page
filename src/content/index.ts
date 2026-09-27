/**
 * Every word of the page lives in `textes.json`: edit it, rebuild, done.
 * Write plain spaces and straight apostrophes; French typography (narrow
 * no-break spaces before « ? », curly apostrophes…) is applied on render.
 */
import textes from "./textes.json";

export type Textes = typeof textes;
export const t: Textes = textes;
export { typo, format, plural } from "@/lib/typography";
