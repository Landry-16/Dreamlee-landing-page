/**
 * The corkboard: cards can be dragged (mouse, finger or arrow keys) and the
 * red threads follow them. Pointing at a card lights up its relations.
 */

const SAG = 0.12;
const KEY_STEP = 12;
/** Positions tried along a thread for its label, so that it avoids the cards. */
const LABEL_SPOTS = [0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8];

type Point = { x: number; y: number };

/** Point at `t` on the quadratic curve a → control → b. */
function along(a: Point, control: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * control.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * control.y + t * t * b.y,
  };
}

interface Relation {
  from: string;
  to: string;
  tag: HTMLElement;
  path: SVGPathElement;
}

export function initBoard(reducedMotion: boolean): void {
  const board = document.querySelector<HTMLElement>("[data-board-area]");
  const svg = board?.querySelector<SVGSVGElement>("[data-threads]");
  if (!board || !svg) return;

  const cards = new Map(
    [...board.querySelectorAll<HTMLElement>("[data-card]")].map((card) => [
      card.dataset.card ?? "",
      card,
    ]),
  );
  const offsets = new Map<string, { x: number; y: number }>();
  const relations: Relation[] = [...board.querySelectorAll<HTMLElement>("[data-from]")].map(
    (tag) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("pathLength", "1");
      svg.append(path);
      return { from: tag.dataset.from ?? "", to: tag.dataset.to ?? "", tag, path };
    },
  );

  const pinOf = (id: string) => {
    const card = cards.get(id);
    if (!card || card.offsetParent === null) return null;
    const pin = card.querySelector("[data-pin]")?.getBoundingClientRect();
    const origin = board.getBoundingClientRect();
    if (!pin) return null;
    return { x: pin.left + pin.width / 2 - origin.left, y: pin.top + pin.height / 2 - origin.top };
  };

  const cardBoxes = () => {
    const origin = board.getBoundingClientRect();
    return [...cards.values()]
      .filter((card) => card.offsetParent !== null)
      .map((card) => {
        const box = card.getBoundingClientRect();
        return {
          left: box.left - origin.left,
          top: box.top - origin.top,
          right: box.right - origin.left,
          bottom: box.bottom - origin.top,
        };
      });
  };

  const draw = () => {
    const boxes = cardBoxes();
    const placed: { left: number; top: number; right: number; bottom: number }[] = [];
    relations.forEach((relation, index) => {
      const a = pinOf(relation.from);
      const b = pinOf(relation.to);
      if (!a || !b) {
        relation.path.removeAttribute("d");
        relation.tag.removeAttribute("data-placed");
        return;
      }
      // A thread hangs a little between its two pins.
      const sag = Math.hypot(b.x - a.x, b.y - a.y) * SAG;
      const control = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + sag };
      relation.path.setAttribute("d", `M${a.x} ${a.y} Q${control.x} ${control.y} ${b.x} ${b.y}`);
      relation.path.style.setProperty("--delay", `${index * 0.15}s`);
      relation.tag.style.setProperty("--delay", `${0.4 + index * 0.15}s`);
      const width = relation.tag.offsetWidth + 8;
      const height = relation.tag.offsetHeight + 8;
      const spots = LABEL_SPOTS.map((t) => {
        const at = along(a, control, b, t);
        const box = {
          left: at.x - width / 2,
          top: at.y - height / 2,
          right: at.x + width / 2,
          bottom: at.y + height / 2,
        };
        const hits = [...boxes, ...placed].filter(
          (other) =>
            box.left < other.right &&
            box.right > other.left &&
            box.top < other.bottom &&
            box.bottom > other.top,
        ).length;
        return { at, box, hits };
      });
      const best = spots.reduce((choice, spot) => (spot.hits < choice.hits ? spot : choice));
      placed.push(best.box);
      relation.tag.style.left = `${best.at.x}px`;
      relation.tag.style.top = `${best.at.y}px`;
      relation.tag.setAttribute("data-placed", "");
    });
  };

  const move = (id: string, x: number, y: number) => {
    const card = cards.get(id);
    if (!card) return;
    offsets.set(id, { x, y });
    card.style.translate = `${x}px ${y}px`;
    draw();
  };

  for (const [id, card] of cards) {
    card.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const start = offsets.get(id) ?? { x: 0, y: 0 };
      const origin = { x: event.clientX, y: event.clientY };
      card.setPointerCapture(event.pointerId);
      card.setAttribute("data-dragging", "");
      const onMove = (moveEvent: PointerEvent) =>
        move(id, start.x + moveEvent.clientX - origin.x, start.y + moveEvent.clientY - origin.y);
      const onUp = () => {
        card.removeAttribute("data-dragging");
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerup", onUp);
        card.removeEventListener("pointercancel", onUp);
      };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerup", onUp);
      card.addEventListener("pointercancel", onUp);
    });

    card.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
      const delta = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[event.key];
      if (!delta) return;
      event.preventDefault();
      const current = offsets.get(id) ?? { x: 0, y: 0 };
      move(id, current.x + (delta[0] ?? 0), current.y + (delta[1] ?? 0));
    });

    const light = (on: boolean) => {
      board.toggleAttribute("data-focus", on);
      for (const relation of relations) {
        const lit = on && (relation.from === id || relation.to === id);
        relation.path.toggleAttribute("data-lit", lit);
        relation.tag.toggleAttribute("data-lit", lit);
      }
    };
    card.addEventListener("pointerenter", () => light(true));
    card.addEventListener("pointerleave", () => light(false));
    card.addEventListener("focus", () => light(true));
    card.addEventListener("blur", () => light(false));
  }

  new ResizeObserver(draw).observe(board);
  void document.fonts.ready.then(draw);
  draw();

  // The threads are drawn once, when the board comes into view.
  if (reducedMotion) return;
  board.setAttribute("data-waiting", "");
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      board.removeAttribute("data-waiting");
      observer.disconnect();
    },
    { threshold: 0.3 },
  );
  observer.observe(board.parentElement ?? board);
}
