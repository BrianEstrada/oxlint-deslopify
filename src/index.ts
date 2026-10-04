import { eslintCompatPlugin } from "@oxlint/plugins";
import type { Plugin, Rule } from "@oxlint/plugins";
import type { AllowWarnDeny, OxlintConfig } from "oxlint";
import { multilineObject } from "./rules/multiline-object.ts";
import { noGraphQLCast } from "./rules/no-graphql-cast.ts";
import { noPropertyTypeLookup } from "./rules/no-property-type-lookup.ts";
import { simpleTernary } from "./rules/simple-ternary.ts";

interface DeslopifyPlugin extends Plugin {
  configs: { recommended: OxlintConfig };
}

const rules: Record<string, Rule> = {
  "multiline-object": multilineObject,
  "no-graphql-cast": noGraphQLCast,
  "no-property-type-lookup": noPropertyTypeLookup,
  "simple-ternary": simpleTernary,
};

const recommendedRules: Record<string, AllowWarnDeny> = Object.fromEntries(
  Object.entries(rules)
    .filter(([, rule]) => {
      return rule.meta?.docs?.recommended === true;
    })
    .map(([name]) => {
      return [`deslopify/${name}`, "error"];
    }),
);

const recommended: OxlintConfig = {
  jsPlugins: ["oxlint-plugin-deslopify"],
  rules: {
    ...recommendedRules,
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

const plugin: DeslopifyPlugin = {
  ...eslintCompatPlugin({
    meta: { name: "oxlint-plugin-deslopify" },
    rules: rules,
  }),
  configs: { recommended: recommended },
};

// noinspection JSUnusedGlobalSymbols
export default plugin;
