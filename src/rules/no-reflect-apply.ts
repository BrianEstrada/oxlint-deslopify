import type { CreateOnceRule } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import { isUnshadowedGlobal } from "../utils/scope.ts";
import { staticMemberName } from "../utils/member-expression.ts";

export const noReflectApply: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `Reflect.apply`; call the function directly so its arguments are checked.",
      recommended: true,
      url: docsUrl("no-reflect-apply"),
    },
    messages: {
      reflect:
        "`Reflect.apply` calls a function without checking its arguments. Call it directly, or put dynamic dispatch behind a named interface.",
    },
  },
  createOnce: function (context) {
    return {
      CallExpression: function (node) {
        if (node.callee.type === "Super") {
          return;
        }
        const member = staticMemberName(node.callee);
        if (
          member?.name !== "apply" ||
          !isUnshadowedGlobal(context.sourceCode, member.object, "Reflect")
        ) {
          return;
        }
        context.report({
          node: node,
          messageId: "reflect",
        });
      },
    };
  },
};
