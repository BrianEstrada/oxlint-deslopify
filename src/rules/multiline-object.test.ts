import assert from "node:assert/strict";
import { it } from "node:test";
import { format } from "oxfmt";
import { multilineObject } from "./multiline-object.ts";
import { ruleTester } from "./rule-tester.ts";

const singleLine = `const a = { type: "text", text: "hi" };\n`;
const fixed = `const a = {\n type: "text", text: "hi" };\n`;

ruleTester.run("multiline-object", multilineObject, {
  valid: [
    "const a = {};",
    "const b = { status: 502 };",
    `const c = {\n  type: "text",\n  text: "hi",\n};`,
  ],
  invalid: [
    {
      code: singleLine,
      output: fixed,
      errors: [{ messageId: "singleLine" }],
    },
  ],
});

void it("formats the fix into one property per line", async () => {
  const { code } = await format("case.ts", fixed);
  assert.equal(code, `const a = {\n  type: "text",\n  text: "hi",\n};\n`);
});
