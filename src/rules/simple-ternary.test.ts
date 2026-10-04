import { ruleTester } from "./rule-tester.ts";
import { simpleTernary } from "./simple-ternary.ts";

ruleTester.run("simple-ternary", simpleTernary, {
  valid: [
    `const a = n === 1 ? "" : "s";`,
    `const b = isCached ? cachedLabel : "";`,
    "const c = `${n} call${n === 1 ? '' : 's'}`;",
    "const d = done ? `finished` : `running`;",
  ],
  invalid: [
    {
      code: `const s =\n  n === 1\n    ? "one"\n    : "many";`,
      errors: [{ messageId: "multiline" }],
    },
    {
      code: `const a = x > 0 && y ? "x" : "y";`,
      errors: [
        {
          messageId: "compoundTest",
          data: { operator: "&&" },
        },
      ],
    },
    {
      code: `const b = x ?? y ? "x" : "y";`,
      errors: [
        {
          messageId: "compoundTest",
          data: { operator: "??" },
        },
      ],
    },
    {
      code: "const s = ok ? ` (${pct}%)` : '';",
      errors: [{ messageId: "templateBranch" }],
    },
  ],
});
