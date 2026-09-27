import { generateTerrain, type GenerationParams, type Terrain } from "@/lib/terrain/generate";
import { MAP_DEFAULTS } from "@/lib/terrain/defaults";
import { renderTerrain } from "@/lib/terrain/render";

/** Terrain grid of the demo (3:2, like the map sheet). */
const CELLS = { width: 180, height: 120 };
const PIXELS_PER_CELL = 4;
/** The detail map zooms on the lighthouse, around this point of the map. */
const DETAIL = { x: 0.48, y: 0.54, width: 0.26 };

const sameAsDefaults = (params: GenerationParams) =>
  (Object.keys(MAP_DEFAULTS) as (keyof GenerationParams)[]).every(
    (key) => params[key] === MAP_DEFAULTS[key],
  );

function paint(
  canvas: HTMLCanvasElement,
  terrain: Terrain,
  k: number,
  origin?: { x: number; y: number },
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const image = context.createImageData(canvas.width, canvas.height);
  renderTerrain(image, terrain, k, origin);
  context.putImageData(image, 0, 0);
}

/**
 * The live map generator: the same algorithm as the app, fed by the
 * form. Place names only fit « Le Continent », so they fade out on any
 * other map.
 */
export function initMapDemo(): void {
  const section = document.querySelector<HTMLElement>("[data-map-demo]");
  const form = section?.querySelector<HTMLFormElement>("[data-map-form]");
  const canvas = section?.querySelector<HTMLCanvasElement>("[data-map-canvas]");
  if (!section || !form || !canvas) return;

  const detail = section.querySelector<HTMLCanvasElement>("[data-map-detail]");
  const image = section.querySelector<HTMLElement>("[data-map-image]");
  const caption = section.querySelector<HTMLElement>("[data-map-caption]");
  const labels = section.querySelectorAll<HTMLElement>("[data-map-labels]");
  const submit = form.querySelector<HTMLButtonElement>("[type=submit]");
  const seedInput = form.elements.namedItem("seed") as HTMLInputElement;

  canvas.width = CELLS.width * PIXELS_PER_CELL;
  canvas.height = CELLS.height * PIXELS_PER_CELL;
  if (detail) {
    detail.width = 596;
    detail.height = 380;
  }

  const read = (): GenerationParams => {
    const value = (name: keyof GenerationParams) =>
      Number((form.elements.namedItem(name) as HTMLInputElement).value);
    return {
      seed: Math.max(0, Math.min(999_999, Math.round(value("seed")) || 0)),
      seaLevel: value("seaLevel"),
      islands: value("islands"),
      relief: value("relief"),
      coast: value("coast"),
    };
  };

  const draw = () => {
    const params = read();
    const terrain = generateTerrain(params, CELLS.width, CELLS.height);
    paint(canvas, terrain, PIXELS_PER_CELL);
    if (detail) {
      const cropWidth = CELLS.width * DETAIL.width;
      const cropHeight = (cropWidth * detail.height) / detail.width;
      paint(detail, terrain, detail.width / cropWidth, {
        x: CELLS.width * DETAIL.x - cropWidth * 0.55,
        y: CELLS.height * DETAIL.y - cropHeight * 0.5,
      });
    }
    image?.setAttribute("hidden", "");
    const isDefault = sameAsDefaults(params);
    labels.forEach((layer) => layer.toggleAttribute("data-hidden", !isDefault));
    if (caption) caption.textContent = `graine ${params.seed}`;
  };

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    submit?.setAttribute("aria-busy", "true");
    requestAnimationFrame(() => {
      draw();
      pending = false;
      submit?.removeAttribute("aria-busy");
    });
  };

  form.addEventListener("input", (event) => {
    const input = event.target as HTMLInputElement;
    const output = form.querySelector<HTMLOutputElement>(`[data-map-output="${input.name}"]`);
    if (output) output.textContent = `${input.value}${input.dataset.unit ?? ""}`;
    if (input.type === "range") schedule();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    schedule();
  });
  section.querySelector("[data-map-dice]")?.addEventListener("click", () => {
    seedInput.value = String(1 + Math.floor(Math.random() * 999_999));
    schedule();
  });

  // Painted when first seen, so that it does not slow the page down.
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      schedule();
    },
    { rootMargin: "300px" },
  );
  observer.observe(section);
}
