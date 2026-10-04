import type { OxlintConfig } from "oxlint";
import { recommended } from "./recommended.ts";

export const opinionated: OxlintConfig = {
  jsPlugins: ["oxlint-plugin-deslopify"],
  rules: {
    ...recommended.rules,
    // Named functions are `function` declarations, not arrows assigned to a
    // const. Inline callbacks are unaffected.
    "func-style": ["error", "declaration"],
    // Write `{ key: key }`, not `{ key }`, and `key: function () {}`, not
    // method shorthand.
    "object-shorthand": ["error", "never"],
    // Braces on every if/else/for/while/do body, so extending one is a clean diff.
    curly: ["error", "all"],
    // Object types are `interface`s, not `type` aliases.
    "typescript/consistent-type-definitions": ["error", "interface"],
    // Arrow functions always get a block body and an explicit `return`.
    "arrow-body-style": ["error", "always"],
    // Type-aware rules from here on: they need `options.typeAware` and oxlint-tsgolint.
    // Flags `@deprecated` APIs, which `tsc` never reports.
    "typescript/no-deprecated": "error",
    // `any` and unchecked casts let unvalidated data through. Parse it instead.
    "typescript/no-unsafe-type-assertion": "error",
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-unsafe-member-access": "error",
    "typescript/no-unsafe-argument": "error",
  },
};
