import { gsap } from "gsap";

/**
 * Versions: dragging the timeline brings that version of the scene to the
 * front. Export: pressing a format stamps it on the title page.
 */
export function initVersions(reducedMotion: boolean): void {
  const range = document.querySelector<HTMLInputElement>("[data-versions-range]");
  const sheets = document.querySelectorAll<HTMLElement>("[data-version]");
  if (range && sheets.length) {
    const texts = JSON.parse(range.dataset.texts ?? "[]") as string[];
    range.addEventListener("input", () => {
      const selected = range.value;
      sheets.forEach((sheet) => {
        const front = sheet.dataset.version === selected;
        sheet.toggleAttribute("data-front", front);
        if (front) sheet.removeAttribute("aria-hidden");
        else sheet.setAttribute("aria-hidden", "true");
      });
      range.setAttribute("aria-valuetext", texts[Number(selected)] ?? selected);
    });
  }

  const stamp = document.querySelector<HTMLElement>("[data-stamp]");
  const hint = document.querySelector<HTMLElement>("[data-format-hint]");
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-format]");
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      if (hint) hint.textContent = button.dataset.hint ?? "";
      if (!stamp) return;
      stamp.textContent = button.dataset.format ?? "";
      stamp.style.color = getComputedStyle(button).color;
      if (!reducedMotion) {
        gsap.fromTo(
          stamp,
          { scale: 1.8, opacity: 0, rotation: -18 },
          { scale: 1, opacity: 0.88, rotation: 0, duration: 0.35, ease: "back.out(2.2)" },
        );
      }
    }),
  );
}
