import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("the page loads without errors and tells what Dreamlee is", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Votre roman est partout/);
  await expect(page.getByRole("link", { name: /Rejoindre la bêta/ }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("the page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
});

test("the visitor takes over the scene being written", async ({ page }) => {
  await page.goto("/#ecrire");
  const scene = page.getByRole("textbox", { name: /écrivez la suite/i });
  await scene.click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type(" Maëlle sourit enfin.");
  await expect(scene).toContainText("Maëlle sourit enfin.");
  await expect(page.locator("[data-typing-count]")).toHaveText(/1\s?251/);
});

test("entry cards move with the keyboard and threads follow", async ({ page, isMobile }) => {
  await page.goto("/#univers");
  const card = page.locator("[data-card=maelle]");
  const before = await card.boundingBox();
  await card.focus();
  await page.keyboard.press("Shift+ArrowRight");
  const after = await card.boundingBox();
  expect((after?.x ?? 0) - (before?.x ?? 0)).toBeGreaterThan(40);
  const threads = page.locator("[data-threads] path[d]");
  await expect(threads).toHaveCount(isMobile ? 4 : 6);
});

test("the map generator draws another world from another seed", async ({ page }) => {
  await page.goto("/#cartes");
  const canvas = page.locator("[data-map-canvas]");
  await canvas.scrollIntoViewIfNeeded();
  await expect(page.locator("[data-map-image]")).toBeHidden();
  const first = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.getByLabel("Graine").fill("7");
  await page.getByRole("button", { name: "Générer", exact: true }).click();
  await expect(page.locator("[data-map-caption]")).toHaveText("graine 7");
  await expect(page.locator("[data-map-labels]").first()).toHaveAttribute("data-hidden", "");
  const second = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  expect(second).not.toEqual(first);
});

test("a captured idea lands in the inbox tray", async ({ page }) => {
  await page.goto("/#capture");
  await page.getByRole("button", { name: "Capturer" }).click();
  await expect(page.locator("[data-capture-status]")).toHaveText(/Écrivez d.abord une idée/);
  await page.getByLabel("Idée", { exact: true }).fill("Le phare parle en morse");
  await page.getByLabel("Idée", { exact: true }).press("Control+Enter");
  await expect(page.locator("[data-capture-count]")).toHaveText(/8 idées à classer/);
  await expect(page.getByLabel("Idée", { exact: true })).toHaveValue("");
});

test("the palette finds entries without accents", async ({ page }) => {
  await page.goto("/#capture");
  const search = page.getByRole("combobox", { name: "Recherche rapide" });
  await search.fill("guilde veil");
  await expect(page.getByRole("option").first()).toContainText("La Guilde des Veilleurs");
  await search.fill("zzz");
  await expect(page.getByRole("option")).toHaveText("Aucun résultat");
});

test("the timeline brings older versions forward and formats get stamped", async ({ page }) => {
  await page.goto("/#versions");
  await page.getByLabel("Version affichée").fill("0");
  await expect(page.locator("[data-version='0']")).toHaveAttribute("data-front", "");
  await page.getByRole("button", { name: "Markdown" }).click();
  await expect(page.locator("[data-stamp]")).toHaveText("Markdown");
  await expect(page.locator("[data-format-hint]")).toContainText("Texte structuré");
});

test("questions open one at a time", async ({ page }) => {
  await page.goto("/#questions");
  const second = page.getByRole("button", { name: "Où sont enregistrés mes textes ?" });
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", { name: "Où sont enregistrés mes textes ?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Faut-il créer un compte ?" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("the beta form checks the address and says when sign-ups open", async ({ page }) => {
  await page.goto("/#beta");
  const email = page.getByRole("textbox", { name: "Adresse e-mail" });
  const submit = page.getByRole("button", { name: "Rejoindre la bêta" });
  await submit.click();
  await expect(page.locator("[data-beta-message]")).toHaveText(/Indiquez votre adresse/);
  await email.fill("camille@exemple");
  await submit.click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await email.fill("camille@exemple.fr");
  await submit.click();
  await expect(page.locator("[data-beta-message]")).toHaveText(/très bientôt/);
  await expect(email).toHaveValue("camille@exemple.fr");
});

test("the menu opens on small screens and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The links are always visible on wide screens.");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Ouvrir le menu" });
  await toggle.click();
  await expect(page.getByRole("link", { name: "Cartes" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
