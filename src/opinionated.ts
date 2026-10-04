import type { DummyRuleMap, OxlintConfig } from "oxlint";
import { recommended } from "./recommended.ts";

// Built-in rules against what agents get wrong: `any`, unchecked casts, dead code.
const slopRules: DummyRuleMap = {
  // Example: `function parse(input: any) {}`
  // `any` turns type checking off. Take `unknown` and narrow it.
  "typescript/no-explicit-any": "error",
  // Example: `const user = { id: 1 } as User`
  // Skips the excess-property check. Write `const user: User = { id: 1 }`.
  "typescript/consistent-type-assertions": [
    "error",
    {
      assertionStyle: "as",
      objectLiteralTypeAssertions: "never",
    },
  ],
  // Example: `const size = n > 9 ? "lg" : n > 4 ? "md" : "sm"`
  // Fits on one line, so `simple-ternary` allows it. Use if/else or a lookup.
  "no-nested-ternary": "error",
  // Example: `(event, item) => { use(item) }` or `catch (error) { retry() }`
  // Prefix with `_` if unused on purpose. Oxlint aliases `typescript/no-unused-vars` to this.
  "no-unused-vars": [
    "error",
    {
      args: "all",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],

  // Type-aware from here on: they need `options.typeAware` and oxlint-tsgolint.
  // Example: `legacyLoad()`, where `legacyLoad` is tagged `@deprecated`
  // Compiles cleanly, and `tsc` never reports it.
  "typescript/no-deprecated": "error",
  // Example: `const user = body as User`, where `body` is `unknown`
  // Skips validation. Parse it with a schema instead.
  "typescript/no-unsafe-type-assertion": "error",
  // Example: `const user: User = JSON.parse(text)`
  // Lets `any` into a typed variable.
  "typescript/no-unsafe-assignment": "error",
  // Example: `JSON.parse(text).user.id`
  // Reads properties off `any`, which nothing checks.
  "typescript/no-unsafe-member-access": "error",
  // Example: `save(JSON.parse(text))`
  // Passes `any` where `save` expects a typed value.
  "typescript/no-unsafe-argument": "error",
};

// Built-in rules that pick one way to write the same code.
const tidinessRules: DummyRuleMap = {
  // Example: `const load = () => {}`
  // Write `function load() {}`. Inline callbacks are unaffected.
  "func-style": ["error", "declaration"],
  // Example: `{ key }` or `{ save() {} }`
  // Write `{ key: key }` and `{ save: function () {} }`.
  "object-shorthand": ["error", "never"],
  // Example: `if (done) return`
  // Write `if (done) { return }`, so adding a line is a clean diff.
  curly: ["error", "all"],
  // Example: `type User = { id: string }`
  // Write `interface User { id: string }`.
  "typescript/consistent-type-definitions": ["error", "interface"],
  // Example: `(x) => x * 2`
  // Write `(x) => { return x * 2 }`.
  "arrow-body-style": ["error", "always"],
  // Example: `import { User } from "./user"`, where `User` is only used as a type
  // Write `import type { User }`.
  "typescript/consistent-type-imports": [
    "error",
    {
      prefer: "type-imports",
    },
  ],
  // Example: `import { a } from "./x"` and `import { b } from "./x"`
  // Merge them into one import.
  "import/no-duplicates": "error",
  // Example: `import { type User, save } from "./user"`
  // Write `import type { User }` and `import { save }` separately.
  "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
};

export const opinionated: OxlintConfig = {
  jsPlugins: ["oxlint-plugin-deslopify"],
  // Only for the `import/*` rules. In a preset this adds to the user's plugins.
  plugins: ["import"],
  rules: {
    ...recommended.rules,
    ...slopRules,
    ...tidinessRules,
  },
};
