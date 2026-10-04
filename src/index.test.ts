import assert from "node:assert/strict";
import { it } from "node:test";
import deslopify from "./index.ts";

const { recommended, opinionated } = deslopify.configs;

void it("recommended turns on only this plugin's recommended rules", () => {
  assert.deepEqual(recommended.rules, {
    "deslopify/multiline-object": "error",
    "deslopify/no-property-type-lookup": "error",
    "deslopify/simple-ternary": "error",
  });
});

void it("opinionated keeps every recommended rule and adds built-in ones", () => {
  assert.deepEqual(opinionated.rules, {
    ...opinionated.rules,
    ...recommended.rules,
  });
  assert.deepEqual(opinionated.rules?.curly, ["error", "all"]);
  assert.equal(opinionated.rules?.["typescript/no-explicit-any"], "error");
});

void it("opinionated enables the import plugin its import rules need", () => {
  assert.equal(opinionated.rules?.["import/no-duplicates"], "error");
  assert.deepEqual(opinionated.plugins, ["import"]);
});

void it("both presets load the plugin by package name", () => {
  assert.deepEqual(recommended.jsPlugins, ["oxlint-plugin-deslopify"]);
  assert.deepEqual(opinionated.jsPlugins, ["oxlint-plugin-deslopify"]);
});
