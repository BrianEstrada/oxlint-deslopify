import { noObjectParameters } from "./no-object-parameters.ts";
import { ruleTester } from "./rule-tester.ts";

ruleTester.run("no-object-parameters", noObjectParameters, {
  valid: [
    "function save(user: User): void {}",
    "function isUser(value: object): value is User { return true; }",
    "function assertUser(value: object): asserts value is User {}",
    "function keys<T extends object>(value: T): void {}",
    "function save(values: object[]): void {}",
    "function save(value: Record<string, string>): void {}",
    "function load(): object { return {}; }",
    // A type parameter named like the alias shadows it.
    "type Loose = object; function save<Loose>(value: Loose): void {}",
  ],
  invalid: [
    {
      code: "function save(value: object): void {}",
      errors: [
        {
          messageId: "object",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "const save = (value: string | (object | null)) => {};",
      errors: [
        {
          messageId: "object",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "interface Store { save(key: string, value: object): void }",
      errors: [
        {
          messageId: "object",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "class Store { constructor(private readonly value: object) {} }",
      errors: [
        {
          messageId: "object",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "function save({ id }: object = {}): void {}",
      errors: [
        {
          messageId: "object",
          data: { parameter: "{ id }" },
        },
      ],
    },
    {
      code: "function save(value: Loose): void {} type Loose = object;",
      errors: [
        {
          messageId: "object",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "type Id<T> = T; function save(value: Id<object>): void {}",
      errors: [
        {
          messageId: "object",
          data: { parameter: "value" },
        },
      ],
    },
    {
      code: "function isUser(value: unknown, context: object): value is User { return true; }",
      errors: [
        {
          messageId: "object",
          data: { parameter: "context" },
        },
      ],
    },
  ],
});
