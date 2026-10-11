import { noUnknownTypeAliases } from "./no-unknown-type-aliases.ts";
import { ruleTester } from "./rule-tester.ts";

function error(alias: string): { messageId: string; data: { alias: string } } {
  return {
    messageId: "alias",
    data: { alias: alias },
  };
}

ruleTester.run("no-unknown-type-aliases", noUnknownTypeAliases, {
  valid: [
    "interface User { readonly id: string }",
    "type Alias = string; type UserId = Alias;",
    "type Payload = string | number;",
    "interface Box<T> { readonly value: T } type Payload = Box<unknown>;",
    "type Values = unknown[];",
  ],
  invalid: [
    {
      code: "type Payload = unknown;",
      errors: [error("Payload")],
    },
    {
      code: "type Alias = UnknownValue; type UnknownValue = unknown;",
      errors: [error("Alias"), error("UnknownValue")],
    },
    {
      code: "type Payload = string | unknown;",
      errors: [error("Payload")],
    },
    {
      code: "type Identity<T> = T; type Payload = Identity<unknown>;",
      errors: [error("Payload")],
    },
    {
      code: "type Identity<T> = T; type Wrapped<T> = Identity<T>; type Payload = Wrapped<unknown>;",
      errors: [error("Payload")],
    },
    {
      code: "function outer() { type Payload = unknown; }",
      errors: [error("Payload")],
    },
  ],
});
