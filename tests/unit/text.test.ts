import { describe, expect, it } from "vitest";
import { isValidEmail } from "@/lib/email";
import { format, plural, typo } from "@/lib/typography";
import { countWords, formatNumber } from "@/lib/words";

describe("typo", () => {
  it("applies French spacing and apostrophes", () => {
    expect(typo("l'idée ? oui : « non » !")).toBe("l’idée ? oui : « non » !");
  });
});

describe("format and plural", () => {
  it("fills placeholders and picks the French plural", () => {
    expect(format("Bonjour {name}", { name: "Maëlle" })).toBe("Bonjour Maëlle");
    const forms = { one: "{count} idée", other: "{count} idées" };
    expect(plural(1, forms)).toBe("1 idée");
    expect(plural(8, forms)).toBe("8 idées");
  });
});

describe("words", () => {
  it("counts words like the editor and formats numbers", () => {
    expect(countWords("Elle leva la lanterne — vers la mer.")).toBe(7);
    expect(formatNumber(84312)).toBe("84 312");
  });
});

describe("isValidEmail", () => {
  it("accepts ordinary addresses and rejects obvious mistakes", () => {
    expect(isValidEmail(" camille@exemple.fr ")).toBe(true);
    expect(isValidEmail("camille@exemple")).toBe(false);
    expect(isValidEmail("camille exemple.fr")).toBe(false);
  });
});
