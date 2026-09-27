import { gsap } from "gsap";

const WIDE = window.matchMedia("(min-width: 1200px)");

/**
 * Questions as index cards: one answer at a time. On wide screens the
 * card leaves the file and lies open beside it; on small screens it
 * unfolds in place and can be closed again.
 */
export function initFaq(reducedMotion: boolean): void {
  const toggles = [...document.querySelectorAll<HTMLButtonElement>("[data-faq-toggle]")];
  const panelOf = (button: HTMLButtonElement) =>
    document.getElementById(button.getAttribute("aria-controls") ?? "");

  const setOpen = (button: HTMLButtonElement, open: boolean) => {
    button.setAttribute("aria-expanded", String(open));
    const panel = panelOf(button);
    if (panel) panel.hidden = !open;
    if (open && panel && !reducedMotion && WIDE.matches) {
      gsap.fromTo(
        panel,
        { x: -120, y: 60, rotation: -8, opacity: 0 },
        { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      );
    }
  };

  for (const button of toggles) {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        // On wide screens a card always lies open.
        if (!WIDE.matches) setOpen(button, false);
        return;
      }
      toggles.forEach((other) => other !== button && setOpen(other, false));
      setOpen(button, true);
    });
  }
}
