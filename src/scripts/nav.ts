/**
 * Navigation bar: transparent over the hero, then a dark band that hides
 * while reading downward and comes back when scrolling up. On small
 * screens, the burger opens the links on a sheet of paper.
 */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return;

  let lastY = window.scrollY;
  const update = () => {
    const y = window.scrollY;
    const menuOpen = nav.querySelector("[data-menu][data-open]");
    if (y < 40) nav.dataset.state = "top";
    else if (y > lastY + 4 && y > 400 && !menuOpen) nav.dataset.state = "hidden";
    else if (y < lastY - 4) nav.dataset.state = "scrolled";
    lastY = y;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  nav.addEventListener("focusin", () => {
    if (nav.dataset.state === "hidden") nav.dataset.state = "scrolled";
  });

  const toggle = nav.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = nav.querySelector<HTMLElement>("[data-menu]");
  const label = nav.querySelector<HTMLElement>("[data-menu-label]");
  if (!toggle || !menu) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.toggleAttribute("data-open", open);
    if (label)
      label.textContent = (open ? toggle.dataset.closeLabel : toggle.dataset.openLabel) ?? "";
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.hasAttribute("data-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}
