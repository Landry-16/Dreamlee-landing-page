/** Length of the demo session, in seconds. */
const SESSION = 25 * 60;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The session timer counts down for real while it is on screen, and
 * starts a new 25-minute session when it reaches zero.
 */
export function initTimer(): void {
  const timer = document.querySelector<HTMLElement>("[data-timer]");
  const time = timer?.querySelector<HTMLTimeElement>("[data-timer-time]");
  const arc = timer?.querySelector<SVGCircleElement>("[data-timer-arc]");
  if (!timer || !time || !arc) return;

  const [minutes = 0, seconds = 0] = (time.textContent ?? "0:0").split(":").map(Number);
  let remaining = minutes * 60 + seconds;
  const length = 2 * Math.PI * (arc.r.baseVal.value || 1);
  let interval = 0;

  const show = () => {
    time.textContent = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
    time.dateTime = `PT${Math.floor(remaining / 60)}M${remaining % 60}S`;
    arc.style.strokeDashoffset = String(length * (1 - remaining / SESSION));
  };

  const tick = () => {
    remaining = remaining > 0 ? remaining - 1 : SESSION;
    show();
  };

  show();
  new IntersectionObserver(([entry]) => {
    window.clearInterval(interval);
    if (entry?.isIntersecting) interval = window.setInterval(tick, 1000);
  }).observe(timer);
}
