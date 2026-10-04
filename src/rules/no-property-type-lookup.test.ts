import { noPropertyTypeLookup } from "./no-property-type-lookup.ts";
import { ruleTester } from "./rule-tester.ts";

ruleTester.run("no-property-type-lookup", noPropertyTypeLookup, {
  valid: [
    "type Effort = (typeof EFFORTS)[number];",
    "type Second = Parameters<typeof f>[1];",
    "type Value = T[K];",
    `const header = headers["x-github-api-version"];`,
  ],
  invalid: [
    {
      code: `type PullRequest = NonNullable<ReviewContext["pullRequest"]>;`,
      errors: [
        {
          messageId: "lookup",
          data: { key: "pullRequest" },
        },
      ],
    },
    {
      code: `type Verdict = z.infer<typeof schema>["verdicts"][number];`,
      errors: [
        {
          messageId: "lookup",
          data: { key: "verdicts" },
        },
      ],
    },
    {
      code: `function f(severity: Finding["severity"]) {}`,
      errors: [
        {
          messageId: "lookup",
          data: { key: "severity" },
        },
      ],
    },
  ],
});
