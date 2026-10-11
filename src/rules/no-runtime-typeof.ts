import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";

const EQUALITY_OPERATORS = new Set(["===", "!==", "==", "!="]);

// The nearest enclosing function returns `x is T` or `asserts x is T`.
function isInsideTypeGuard(node: ESTree.Node): boolean {
  let current: ESTree.Node | null = node.parent;
  while (current !== null && current.type !== "Program") {
    if (
      current.type === "ArrowFunctionExpression" ||
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression"
    ) {
      return current.returnType?.typeAnnotation.type === "TSTypePredicate";
    }
    current = current.parent;
  }
  return false;
}

// `typeof window === "undefined"` asks whether a global exists, not what a value is.
function isExistenceProbe(node: ESTree.UnaryExpression): boolean {
  const { parent } = node;
  if (
    parent.type !== "BinaryExpression" ||
    !EQUALITY_OPERATORS.has(parent.operator)
  ) {
    return false;
  }
  let other = parent.left;
  if (parent.left === node) {
    other = parent.right;
  }
  return other.type === "Literal" && other.value === "undefined";
}

export const noRuntimeTypeof: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `typeof` checks outside type guards; parse input with a schema instead.",
      recommended: true,
      url: docsUrl("no-runtime-typeof"),
    },
    messages: {
      typeof:
        "Don't check `typeof` inline. Parse untrusted input with a schema (e.g. Zod), or move the check into a type guard (`x is T`).",
    },
  },
  createOnce: function (context) {
    return {
      UnaryExpression: function (node) {
        if (
          node.operator !== "typeof" ||
          isExistenceProbe(node) ||
          isInsideTypeGuard(node)
        ) {
          return;
        }
        context.report({
          node: node,
          messageId: "typeof",
        });
      },
    };
  },
};
