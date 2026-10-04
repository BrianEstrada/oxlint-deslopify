import type { CreateOnceRule } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";

// Octokit's `graphql<T>` only casts the response, and without a type argument
// it's `any`, which the no-unsafe-* rules only catch once it's used.
export const noGraphQLCast: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require `graphql<unknown>` so GraphQL responses are parsed, not cast.",
      recommended: false,
      url: docsUrl("no-graphql-cast"),
    },
    messages: {
      cast: "`graphql<T>` casts the response without checking it. Call `graphql<unknown>` and parse the result with a schema (e.g. Zod).",
    },
  },
  createOnce: function (context) {
    return {
      CallExpression: function (node) {
        const { callee } = node;
        if (
          callee.type !== "MemberExpression" ||
          callee.computed ||
          callee.property.name !== "graphql"
        ) {
          return;
        }
        const params = node.typeArguments?.params ?? [];
        if (params.length === 1 && params[0]?.type === "TSUnknownKeyword") {
          return;
        }
        context.report({
          node: node,
          messageId: "cast",
        });
      },
    };
  },
};
