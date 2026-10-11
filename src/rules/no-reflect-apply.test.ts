import { noReflectApply } from "./no-reflect-apply.ts";
import { ruleTester } from "./rule-tester.ts";

const error = { messageId: "reflect" };

ruleTester.run("no-reflect-apply", noReflectApply, {
  valid: [
    "const value = operation.apply(owner, args);",
    "Reflect.get(owner, key);",
    "const Reflect = { apply() { return 1; } }; Reflect.apply();",
    "function invoke(Reflect: { apply(): number }) { return Reflect.apply(); }",
  ],
  invalid: [
    {
      code: "const value = Reflect.apply(operation, owner, args);",
      errors: [error],
    },
    {
      code: "const value = Reflect['apply'](operation, owner, args);",
      errors: [error],
    },
  ],
});
