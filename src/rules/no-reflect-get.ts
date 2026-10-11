import type { CreateOnceRule } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import { isUnshadowedGlobal } from "../utils/scope.ts";
import { staticMemberName } from "../utils/member-expression.ts";

export const noReflectGet: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `Reflect.get`; read the property directly so its type is checked.",
      recommended: true,
      url: docsUrl("no-reflect-get"),
    },
    messages: {
      reflect:
        "`Reflect.get` reads a property without checking its type. Read it directly, and parse untyped input into a named type first.",
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
          member?.name !== "get" ||
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
