import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import { isUnknownOrUnion, resolvedTypeMatches } from "../utils/type-alias.ts";

export const noUnknownTypeAliases: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow type aliases that resolve to `unknown`, such as `type Payload = unknown`.",
      recommended: true,
      url: docsUrl("no-unknown-type-aliases"),
    },
    messages: {
      alias:
        "`{{alias}}` is `unknown` under another name. Describe the real type, or parse with a schema (e.g. Zod) and use its inferred type.",
    },
  },
  createOnce: function (context) {
    let aliases: ESTree.TSTypeAliasDeclaration[] = [];

    return {
      before: function () {
        aliases = [];
      },
      TSTypeAliasDeclaration: function (node) {
        aliases.push(node);
      },
      // Aliases can be used before they're declared, so check once all are collected.
      "Program:exit": function () {
        for (const alias of aliases) {
          if (
            !resolvedTypeMatches(
              alias.typeAnnotation,
              aliases,
              isUnknownOrUnion,
            )
          ) {
            continue;
          }
          context.report({
            node: alias.id,
            messageId: "alias",
            data: { alias: alias.id.name },
          });
        }
      },
    };
  },
};
