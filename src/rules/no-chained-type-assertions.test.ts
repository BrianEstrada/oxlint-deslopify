import { noChainedTypeAssertions } from "./no-chained-type-assertions.ts";
import { ruleTester } from "./rule-tester.ts";

const error = { messageId: "chained" };

ruleTester.run("no-chained-type-assertions", noChainedTypeAssertions, {
  valid: [
    "const value = input as User;",
    "const value = (input as User);",
    "const value = ({ id: 1 } as const) as const;",
    "const value = (input as User).name as string;",
  ],
  invalid: [
    {
      code: "const value = input as unknown as User;",
      errors: [error],
    },
    {
      code: "const value = (input as unknown) as User;",
      errors: [error],
    },
    {
      code: "const value = <User>(<unknown>input);",
      errors: [error],
    },
    {
      code: "const value = ({ id: 1 } as const) as User;",
      errors: [error],
    },
    {
      code: "const value = input as any as User as Admin;",
      errors: [error],
    },
  ],
});
