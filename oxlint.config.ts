import { defineConfig } from "oxlint";
import deslopify from "./src/index.ts";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  // Default rules are all "correctness" rules, which oxlint reports as warnings.
  // Promote them to errors.
  categories: {
    correctness: "error",
  },
  // Load the rules from source, so linting doesn't need a build first. Not via
  // `extends`: oxlint rejects relative plugin paths in extended configs.
  jsPlugins: ["./src/index.ts"],
  // A top-level `plugins` replaces Oxlint's defaults, so list them with the preset's `import`.
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import"],
  rules: deslopify.configs.opinionated.rules,
  options: {
    typeAware: true,
    // Backstop for any rule turned on later as "warn": warnings still fail lint.
    denyWarnings: true,
  },
});
