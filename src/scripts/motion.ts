import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** Wide screens get the full choreography; small ones a lighter version. */
const WIDE = "(min-width: 1200px)";

/** Smooth scrolling, kept in step with ScrollTrigger. */
function initSmoothScroll(): void {
  const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -72 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** The objects fall on the desk one after the other, then the thread tightens. */
function heroIntro(): void {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const thread = hero.querySelector<SVGPathElement>("[data-thread] path");
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  timeline.from(hero.querySelector("[data-sheet]"), { y: 24, opacity: 0, duration: 0.8 });
  timeline.from(
    hero.querySelectorAll("[data-drop]"),
    {
      y: -70,
      opacity: 0,
      rotation: (index: number) => (index % 2 ? 9 : -9),
      scale: 1.06,
      duration: 0.75,
      stagger: 0.07,
      ease: "back.out(1.4)",
    },
    0.15,
  );
  if (thread) {
    const length = thread.getTotalLength();
    timeline.fromTo(
      thread,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" },
      0.7,
    );
  }
}

/** While scrolling into « le rangement », each object glides to its place. */
function tidyUp(): void {
  const section = document.querySelector("[data-tidy]");
  if (!section) return;
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 85%", end: "center 55%", scrub: 0.6 },
  });
  timeline.from(section.querySelector("[data-tidy-window]"), {
    y: 60,
    scale: 0.94,
    opacity: 0.4,
    ease: "none",
  });
  section.querySelectorAll<HTMLElement>("[data-tidy-object]").forEach((object, index) => {
    const side = object.dataset.tidyObject === "left" ? -1 : 1;
    timeline.from(
      object,
      {
        x: side * 240,
        y: -220 + index * 30,
        rotation: side * 28,
        scale: 1.8,
        ease: "power2.out",
      },
      0,
    );
  });
  timeline.from(
    section.querySelectorAll("[data-tidy-label]"),
    { opacity: 0, x: (index: number) => (index < 2 ? -20 : 20), stagger: 0.08 },
    0.45,
  );
}

/** The bars of the statistics grow from the axis, day after day. */
function growBars(): void {
  const bars = document.querySelectorAll("[data-bar]");
  if (!bars.length) return;
  gsap.from(bars, {
    scaleY: 0,
    transformOrigin: "50% 100%",
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.025,
    scrollTrigger: { trigger: bars[0]?.closest("figure") ?? bars[0], start: "top 75%", once: true },
  });
}

/** At the end of the page the desk is tidy: the objects straighten up. */
function tidyDesk(): void {
  const objects = document.querySelectorAll("[data-tidy-end]");
  if (!objects.length) return;
  gsap.from(objects, {
    x: (index: number) => (index < 2 ? -80 : 80),
    y: -40,
    rotation: (index: number) => [-14, 9, 12, -18][index] ?? 0,
    ease: "power2.out",
    scrollTrigger: {
      trigger: objects[0]?.closest("section") ?? objects[0],
      start: "top 85%",
      end: "top 25%",
      scrub: 0.6,
    },
  });
}

/**
 * Starts the scroll choreography, unless the visitor asked for less motion:
 * then everything is simply shown in its final, tidy state.
 */
export function initMotion(reducedMotion: boolean): void {
  if (reducedMotion) return;
  initSmoothScroll();
  heroIntro();
  growBars();
  const media = gsap.matchMedia();
  media.add(WIDE, () => {
    tidyUp();
    tidyDesk();
  });
}
