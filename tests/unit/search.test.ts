import { describe, expect, it } from "vitest";
import { fold, search } from "@/lib/search";

const index = [
  { text: "Chap. 5 : Maëlle seule", kind: "Chapitre" },
  { text: "Maëlle", kind: "Fiche" },
  { text: "La Guilde des Veilleurs", kind: "Fiche" },
];

describe("search", () => {
  it("ignores accents and case", () => {
    expect(fold("MAËLLE Élevée")).toBe("maelle elevee");
    expect(search(index, "maelle").map((item) => item.kind)).toEqual(["Fiche", "Chapitre"]);
  });

  it("needs every word and returns nothing for a blank query", () => {
    expect(search(index, "guilde veill")).toEqual([index[2]]);
    expect(search(index, "guilde maelle")).toEqual([]);
    expect(search(index, "   ")).toEqual([]);
  });
});
