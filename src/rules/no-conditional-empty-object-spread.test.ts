import { noConditionalEmptyObjectSpread } from "./no-conditional-empty-object-spread.ts";
import { ruleTester } from "./rule-tester.ts";

const error = { messageId: "spread" };

ruleTester.run(
  "no-conditional-empty-object-spread",
  noConditionalEmptyObjectSpread,
  {
    valid: [
      "const result = { value };",
      "const result = { ...values };",
      "const result = condition ? { value } : {};",
      "const result = { ...(condition ? a : b) };",
      "const list = [...(condition ? [a] : [])];",
    ],
    invalid: [
      {
        code: "const result = { ...(value !== undefined ? { value } : {}) };",
        errors: [error],
      },
      {
        code: "const result = { ...(condition ? {} : { value }) };",
        errors: [error],
      },
      {
        code: "const result = { a, ...(condition ? { b } : {}) };",
        errors: [error],
      },
    ],
  },
);
