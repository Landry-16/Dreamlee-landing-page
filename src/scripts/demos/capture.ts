import { gsap } from "gsap";
import { format, plural } from "@/lib/typography";

const NOTE_COLORS = ["var(--postit-yellow)", "var(--postit-orange)", "var(--paper)"];

/** Whether a key event happens while typing in a field of the page. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.closest("input, textarea, [contenteditable]") !== null;

/**
 * Quick capture: the idea written on the post-it flies into the letter
 * tray and the counter goes up. Ctrl+Alt+N brings the pad, like in the app.
 */
export function initCapture(reducedMotion: boolean): void {
  const section = document.querySelector<HTMLElement>("[data-capture]");
  const form = section?.querySelector<HTMLFormElement>("[data-capture-form]");
  const field = form?.querySelector<HTMLTextAreaElement>("textarea");
  const status = section?.querySelector<HTMLElement>("[data-capture-status]");
  const counter = section?.querySelector<HTMLElement>("[data-capture-count]");
  const tray = section?.querySelector<HTMLElement>("[data-capture-tray]");
  if (!section || !form || !field || !status || !counter || !tray) return;

  let count = Number(counter.dataset.count ?? 0);
  let captured = 0;

  const announce = (message: string) => {
    status.textContent = "";
    window.setTimeout(() => (status.textContent = message), 50);
  };

  const landInTray = () => {
    count += 1;
    counter.textContent = plural(count, {
      one: counter.dataset.one ?? "",
      other: counter.dataset.other ?? "",
    });
    if (!reducedMotion)
      gsap.fromTo(tray, { y: 6 }, { y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  const fly = (text: string) => {
    const from = form.getBoundingClientRect();
    const to = tray.getBoundingClientRect();
    const note = document.createElement("p");
    note.className = "capture__flight";
    note.textContent = text.length > 40 ? `${text.slice(0, 38)}…` : text;
    note.style.setProperty("--note", NOTE_COLORS[captured % NOTE_COLORS.length] ?? "");
    note.style.left = `${from.left + from.width / 2 - 60}px`;
    note.style.top = `${from.top + from.height / 2 - 55}px`;
    document.body.append(note);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height * 0.3 - (from.top + from.height / 2);
    const timeline = gsap.timeline({
      onComplete: () => {
        note.remove();
        landInTray();
      },
    });
    timeline.fromTo(
      note,
      { scale: 1.6, rotation: -3 },
      { scale: 0.7, rotation: 14, duration: 0.9, ease: "power1.in" },
      0,
    );
    timeline.to(note, { x: dx, duration: 0.9, ease: "power1.inOut" }, 0);
    timeline.to(note, { y: dy, duration: 0.9, ease: "back.in(1.6)" }, 0);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = field.value.trim();
    if (!text) {
      announce(status.dataset.empty ?? "");
      field.focus();
      if (!reducedMotion)
        gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
      return;
    }
    captured += 1;
    field.value = "";
    announce(format(status.dataset.done ?? "", { text }));
    if (reducedMotion) landInTray();
    else fly(text);
  });

  field.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.ctrlKey &&
      event.altKey &&
      event.key.toLowerCase() === "n" &&
      !isTyping(event.target)
    ) {
      event.preventDefault();
      form.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
      field.focus({ preventScroll: true });
    }
  });
}
