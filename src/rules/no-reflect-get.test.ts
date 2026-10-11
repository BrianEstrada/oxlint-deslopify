import { noReflectGet } from "./no-reflect-get.ts";
import { ruleTester } from "./rule-tester.ts";

const error = { messageId: "reflect" };

ruleTester.run("no-reflect-get", noReflectGet, {
  valid: [
    "const value = owner.property;",
    "const value = owner[key];",
    "Reflect.set(owner, key, value);",
    "const Reflect = { get() { return 1; } }; Reflect.get();",
    "function read(Reflect: { get(): number }) { return Reflect.get(); }",
  ],
  invalid: [
    {
      code: "const value = Reflect.get(owner, key);",
      errors: [error],
    },
    {
      code: "const value = Reflect['get'](owner, key);",
      errors: [error],
    },
  ],
});
