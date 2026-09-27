/**
 * Enforces the Conventional Commits specification.
 * @see https://www.conventionalcommits.org
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      [
        "hero",
        "tidy",
        "writing",
        "world",
        "maps",
        "capture",
        "progress",
        "versions",
        "colophon",
        "faq",
        "beta",
        "content",
        "layout",
        "motion",
        "a11y",
        "design",
        "deps",
        "ci",
        "docs",
      ],
    ],
  },
};
