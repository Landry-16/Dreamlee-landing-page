import { initBoard } from "./demos/board";
import { initCapture } from "./demos/capture";
import { initPalette } from "./demos/palette";
import { initMapDemo } from "./demos/map-demo";
import { initTyping } from "./demos/typing";
import { initMotion } from "./motion";
import { initNav } from "./nav";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initNav();
initMotion(reducedMotion);
initTyping(reducedMotion);
initBoard(reducedMotion);
initMapDemo();
initCapture(reducedMotion);
initPalette();
