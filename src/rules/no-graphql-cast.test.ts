import { noGraphQLCast } from "./no-graphql-cast.ts";
import { ruleTester } from "./rule-tester.ts";

ruleTester.run("no-graphql-cast", noGraphQLCast, {
  valid: [
    `github.graphql<unknown>("query { viewer { login } }");`,
    "class C { #github = github; f() { return this.#github.graphql<unknown>(QUERY, { n: 1 }); } }",
    `github.request<Foo>("GET /user");`,
  ],
  invalid: [
    {
      code: "github.graphql<{ viewer: { login: string } }>(QUERY);",
      errors: [{ messageId: "cast" }],
    },
    {
      code: "github.graphql(QUERY);",
      errors: [{ messageId: "cast" }],
    },
  ],
});
