import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import {
  bindingName,
  isTypePredicateSubject,
  typeAnnotationOf,
} from "../utils/parameter.ts";
import type { ParameterOwner } from "../utils/parameter.ts";

function containsUnknown(type: ESTree.TSType): boolean {
  if (type.type === "TSUnknownKeyword") {
    return true;
  }
  if (type.type === "TSParenthesizedType") {
    return containsUnknown(type.typeAnnotation);
  }
  return type.type === "TSUnionType" && type.types.some(containsUnknown);
}

// `cause` mirrors `Error`'s own `cause: unknown`, which wraps whatever was thrown.
export const noUnknownParameters: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `unknown` parameters, except a type guard's subject and `cause`; take a parsed type instead.",
      recommended: true,
      url: docsUrl("no-unknown-parameters"),
    },
    messages: {
      unknown:
        "Parameter `{{parameter}}` takes unparsed input. Take a named type, and parse with a schema (e.g. Zod) before calling this.",
    },
  },
  createOnce: function (context) {
    function check(node: ParameterOwner): void {
      for (const parameter of node.params) {
        const annotation = typeAnnotationOf(parameter);
        if (
          annotation === null ||
          annotation === undefined ||
          !containsUnknown(annotation.typeAnnotation)
        ) {
          continue;
        }
        const name = bindingName(parameter, context.sourceCode);
        if (name === "cause" || isTypePredicateSubject(node, name)) {
          continue;
        }
        context.report({
          node: annotation.typeAnnotation,
          messageId: "unknown",
          data: { parameter: name },
        });
      }
    }
    return {
      ArrowFunctionExpression: check,
      FunctionDeclaration: check,
      FunctionExpression: check,
      TSCallSignatureDeclaration: check,
      TSConstructSignatureDeclaration: check,
      TSConstructorType: check,
      TSDeclareFunction: check,
      TSEmptyBodyFunctionExpression: check,
      TSFunctionType: check,
      TSMethodSignature: check,
    };
  },
};
