import { search, fold, type Searchable } from "@/lib/search";
import { format } from "@/lib/typography";

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"]/g,
    (character) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot" }[character]};`,
  );

/** Wraps in <mark> the parts of `text` matching the query, accents ignored. */
function highlight(text: string, query: string): string {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const folded = fold(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const word of words) {
    let from = folded.indexOf(word);
    while (from !== -1) {
      for (let i = from; i < from + word.length; i += 1) marks[i] = true;
      from = folded.indexOf(word, from + word.length);
    }
  }
  // `fold` keeps one character per character of `text` (accents only removed).
  let html = "";
  for (let i = 0; i < text.length; i += 1) {
    const character = escapeHtml(text[i] ?? "");
    const open = marks[i] && !marks[i - 1];
    const close = marks[i] && !marks[i + 1];
    html += `${open ? "<mark>" : ""}${character}${close ? "</mark>" : ""}`;
  }
  return html;
}

/**
 * The Ctrl+K palette, searching for real in a small index of the demo
 * novel: accents and case do not matter. Ctrl+K anywhere focuses it.
 */
export function initPalette(): void {
  const palette = document.querySelector<HTMLElement>("[data-palette]");
  const input = palette?.querySelector<HTMLInputElement>("[data-palette-input]");
  const list = palette?.querySelector<HTMLElement>("[data-palette-results]");
  const all = palette?.querySelector<HTMLElement>("[data-palette-all]");
  const data = palette?.querySelector("[data-palette-index]")?.textContent;
  if (!palette || !input || !list || !all || !data) return;

  const index = JSON.parse(data) as Searchable[];
  let active = 0;

  const render = () => {
    const query = input.value;
    const results = search(index, query, 4);
    active = Math.min(active, Math.max(results.length - 1, 0));
    list.innerHTML = results.length
      ? results
          .map(
            (item, i) =>
              `<li role="option" id="palette-option-${i}" aria-selected="${i === active}"><span>${highlight(item.text, query)}</span><span class="kind">${escapeHtml(item.kind)}</span></li>`,
          )
          .join("")
      : `<li class="empty" role="option" aria-disabled="true" aria-selected="false">${escapeHtml(list.dataset.none ?? "")}</li>`;
    input.setAttribute("aria-activedescendant", results.length ? `palette-option-${active}` : "");
    all.textContent = query.trim()
      ? format(all.dataset.template ?? "", { query: query.trim() })
      : "";
  };

  input.addEventListener("input", () => {
    active = 0;
    render();
  });
  input.addEventListener("keydown", (event) => {
    const count = list.querySelectorAll("[role=option]:not([aria-disabled])").length;
    if (!count) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      active = (active + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
      render();
    }
  });
  list.addEventListener("pointermove", (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>("[role=option]");
    const position = option ? [...list.children].indexOf(option) : -1;
    if (position >= 0 && position !== active && !option?.hasAttribute("aria-disabled")) {
      active = position;
      render();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      palette.scrollIntoView({ block: "center", behavior: "smooth" });
      input.focus({ preventScroll: true });
      input.select();
    }
  });

  render();
}
