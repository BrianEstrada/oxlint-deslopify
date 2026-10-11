import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import { unwrapParentheses } from "../utils/parentheses.ts";

function isEmptyObject(node: ESTree.Expression): boolean {
  return node.type === "ObjectExpression" && node.properties.length === 0;
}

// No fix: omitting a key isn't the same as setting it to `undefined`.
export const noConditionalEmptyObjectSpread: CreateOnceRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow spreading `cond ? { key } : {}` to add a property conditionally.",
      recommended: true,
      url: docsUrl("no-conditional-empty-object-spread"),
    },
    messages: {
      spread:
        "Don't spread `cond ? { ... } : {}` to add a property. Build the object first, then set the property in an `if`.",
    },
  },
  createOnce: function (context) {
    return {
      SpreadElement: function (node) {
        if (node.parent.type !== "ObjectExpression") {
          return;
        }
        const argument = unwrapParentheses(node.argument);
        if (
          argument.type !== "ConditionalExpression" ||
          !(
            isEmptyObject(argument.consequent) ||
            isEmptyObject(argument.alternate)
          )
        ) {
          return;
        }
        context.report({
          node: node,
          messageId: "spread",
        });
      },
    };
  },
};
