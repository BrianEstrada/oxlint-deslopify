import type { CreateOnceRule } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";

export const simpleTernary: CreateOnceRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Keep ternaries on one line, testing one condition, without interpolated strings.",
      recommended: true,
      url: docsUrl("simple-ternary"),
    },
    messages: {
      multiline:
        "Ternary spans multiple lines. Use if/else or extract a function.",
      compoundTest:
        "Ternary test combines conditions with `{{operator}}`. Name the condition or use if/else.",
      templateBranch:
        "Ternary branch builds an interpolated string. Build it outside the ternary.",
    },
  },
  createOnce: function (context) {
    return {
      ConditionalExpression: function (node) {
        if (node.loc.start.line !== node.loc.end.line) {
          context.report({
            node: node,
            messageId: "multiline",
          });
        }
        if (node.test.type === "LogicalExpression") {
          context.report({
            node: node.test,
            messageId: "compoundTest",
            data: { operator: node.test.operator },
          });
        }
        for (const branch of [node.consequent, node.alternate]) {
          if (
            branch.type === "TemplateLiteral" &&
            branch.expressions.length > 0
          ) {
            context.report({
              node: branch,
              messageId: "templateBranch",
            });
          }
        }
      },
    };
  },
};
