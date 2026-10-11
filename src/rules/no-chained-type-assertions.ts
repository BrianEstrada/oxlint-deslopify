import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";
import { isConstAssertion, isTypeAssertion } from "./type-assertion.ts";
import type { TypeAssertion } from "./type-assertion.ts";

function unwrapParentheses(expression: ESTree.Expression): ESTree.Expression {
  let current = expression;
  while (current.type === "ParenthesizedExpression") {
    current = current.expression;
  }
  return current;
}

// Report a chain once, from its outermost assertion.
function isOutermost(node: TypeAssertion): boolean {
  let current: ESTree.Node = node;
  let { parent } = node;
  while (
    parent.type === "ParenthesizedExpression" &&
    parent.expression === current
  ) {
    current = parent;
    parent = parent.parent;
  }
  return !isTypeAssertion(parent) || parent.expression !== current;
}

// `as const` chains add no unchecked claim, so a chain needs one other assertion.
function isChainWithCast(node: TypeAssertion): boolean {
  let count = 0;
  let hasCast = false;
  let current: ESTree.Expression = node;
  while (isTypeAssertion(current)) {
    count += 1;
    hasCast ||= !isConstAssertion(current);
    current = unwrapParentheses(current.expression);
  }
  return count > 1 && hasCast;
}

export const noChainedTypeAssertions: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow chained type assertions such as `x as unknown as T`.",
      recommended: true,
      url: docsUrl("no-chained-type-assertions"),
    },
    messages: {
      chained:
        "This chain of assertions forces a type TypeScript rejected. Keep the value's real type, or parse untrusted input with a schema (e.g. Zod).",
    },
  },
  createOnce: function (context) {
    function check(node: TypeAssertion): void {
      if (isOutermost(node) && isChainWithCast(node)) {
        context.report({
          node: node,
          messageId: "chained",
        });
      }
    }
    return {
      TSAsExpression: check,
      TSTypeAssertion: check,
    };
  },
};
