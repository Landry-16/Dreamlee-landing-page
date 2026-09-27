import { countWords, formatNumber } from "@/lib/words";

/** Delay between two typed characters, like a person writing. */
function keystrokeDelay(character: string): number {
  if (".!?".includes(character)) return 420;
  if (",;:".includes(character)) return 220;
  if (character === " ") return 70;
  return 38 + Math.random() * 55;
}

/**
 * The focus-mode sheet writes its last paragraph by itself once visible.
 * As soon as the visitor clicks or types, the paragraph is theirs: the
 * word count follows and « Enregistré » blinks after each pause.
 */
export function initTyping(reducedMotion: boolean): void {
  const sheet = document.querySelector<HTMLElement>("[data-typing]");
  const field = sheet?.querySelector<HTMLElement>("[data-typing-field]");
  const count = sheet?.querySelector<HTMLElement>("[data-typing-count]");
  const saved = sheet?.querySelector<HTMLElement>("[data-typing-saved]");
  if (!sheet || !field || !count || !saved) return;

  // Browsers without plain-text editing still get an editable paragraph.
  if (field.contentEditable !== "plaintext-only") field.contentEditable = "true";

  const text = sheet.dataset.text ?? field.textContent ?? "";
  const baseWords = Number(sheet.dataset.baseWords ?? 0);
  const savedLabel = saved.textContent ?? "";
  let saveTimer = 0;
  let handedOver = false;

  const updateCount = (value: string) => {
    count.textContent = formatNumber(baseWords + countWords(value));
  };

  const markSaving = () => {
    saved.setAttribute("data-saving", "");
    saved.textContent = "Enregistrement…";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saved.removeAttribute("data-saving");
      saved.textContent = savedLabel;
    }, 700);
  };

  const handOver = () => {
    if (handedOver) return;
    handedOver = true;
    field.querySelector(".write__caret")?.remove();
    field.textContent = (field.textContent ?? "").trimEnd();
  };

  field.addEventListener("pointerdown", handOver);
  field.addEventListener("focus", handOver);
  field.addEventListener("input", () => {
    updateCount(field.textContent ?? "");
    markSaving();
  });

  if (reducedMotion) return;

  const caret = document.createElement("span");
  caret.className = "write__caret";
  caret.setAttribute("aria-hidden", "true");

  const type = (index: number) => {
    if (handedOver) return;
    const typed = text.slice(0, index);
    field.textContent = typed;
    field.append(caret);
    updateCount(typed);
    if (index >= text.length) return;
    if (text[index] === " ") markSaving();
    window.setTimeout(() => type(index + 1), keystrokeDelay(text[index] ?? ""));
  };

  field.textContent = "";
  field.append(caret);
  updateCount("");
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      window.setTimeout(() => type(1), 500);
    },
    { threshold: 0.5 },
  );
  observer.observe(sheet);
}
