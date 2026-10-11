import { noRuntimeTypeof } from "./no-runtime-typeof.ts";
import { ruleTester } from "./rule-tester.ts";

const error = { messageId: "typeof" };

ruleTester.run("no-runtime-typeof", noRuntimeTypeof, {
  valid: [
    'const isServer = typeof document === "undefined";',
    'const hasStorage = typeof localStorage !== "undefined";',
    'const missing = "undefined" === typeof process;',
    "type Config = typeof config;",
    'function isString(value: unknown): value is string { return typeof value === "string"; }',
    'const isString = (value: unknown): value is string => typeof value === "string";',
    'function assertString(value: unknown): asserts value is string { if (typeof value !== "string") throw new Error(); }',
  ],
  invalid: [
    {
      code: 'if (typeof input === "string") use(input);',
      errors: [error],
    },
    {
      code: "if (typeof input === undefined) use(input);",
      errors: [error],
    },
    {
      code: "const kind = typeof input;",
      errors: [error],
    },
    {
      code: 'function parse(value: unknown): string { if (typeof value !== "string") throw new Error(); return value; }',
      errors: [error],
    },
    {
      code: 'function isString(value: unknown): value is string { const check = () => typeof value === "string"; return check(); }',
      errors: [error],
    },
  ],
});
