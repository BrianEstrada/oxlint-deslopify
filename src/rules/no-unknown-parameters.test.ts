import { noUnknownParameters } from "./no-unknown-parameters.ts";
import { ruleTester } from "./rule-tester.ts";

ruleTester.run("no-unknown-parameters", noUnknownParameters, {
  valid: [
    "function enrich(cause: unknown): void {}",
    "function enrich(cause: Error | unknown): void {}",
    "function isString(value: unknown): value is string { return true; }",
    "const isString = (value: unknown): value is string => true;",
    "function assertString(value: unknown): asserts value is string {}",
    "type Guard = (value: unknown) => value is string;",
    "declare function isString(value: unknown): value is string;",
    "interface Guards { isString(value: unknown): value is string }",
    "function parse(value: string | number): void {}",
    "const data = await graphql<unknown>(query);",
    // Only a bare `unknown` (or a union with it) is checked, not `unknown[]`.
    "function log(...args: unknown[]): void {}",
  ],
  invalid: [
    {
      code: "function parse(value: unknown): void {}",
      errors: [
        {
          messageId: "unknown",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "function parse(value: string | (number | unknown)): void {}",
      errors: [
        {
          messageId: "unknown",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "const handle = (event: unknown) => {};",
      errors: [
        {
          messageId: "unknown",
          data: { parameter: "event" },
        },
      ],
    },
    {
      code: "function isString(value: unknown, context: unknown): value is string { return true; }",
      errors: [
        {
          messageId: "unknown",
          data: { parameter: "context" },
        },
      ],
    },
    {
      code: "export function parse({ value }: unknown = {}): void {}",
      errors: [
        {
          messageId: "unknown",
          data: { parameter: "{ value }" },
        },
      ],
    },
  ],
});
