import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";

// Run with `node --test`: RuleTester refuses Bun, which can't allocate the
// 6 GiB buffer it parses into.
RuleTester.describe = describe;
RuleTester.it = it;

export const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});
