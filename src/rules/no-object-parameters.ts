import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import {
  bindingName,
  isTypePredicateSubject,
  typeAnnotationOf,
} from "../utils/parameter.ts";
import type { ParameterOwner } from "../utils/parameter.ts";
import { resolvedTypeMatches } from "../utils/type-alias.ts";

interface Candidate {
  type: ESTree.TSType;
  name: string;
}

function isObjectOrUnion(
  type: ESTree.TSType,
  matches: (child: ESTree.TSType) => boolean,
): boolean {
  if (type.type === "TSObjectKeyword") {
    return true;
  }
  if (type.type === "TSParenthesizedType") {
    return matches(type.typeAnnotation);
  }
  return type.type === "TSUnionType" && type.types.some(matches);
}

export const noObjectParameters: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `object` parameters, except a type guard's subject; take the type the function needs instead.",
      recommended: true,
      url: docsUrl("no-object-parameters"),
    },
    messages: {
      object:
        "Parameter `{{parameter}}` takes `object`, which says nothing about its shape. Take the type it needs: a named type, a schema's (e.g. Zod) inferred type, or a JSON value type if it only serializes the value.",
    },
  },
  createOnce: function (context) {
    let aliases: ESTree.TSTypeAliasDeclaration[] = [];
    let candidates: Candidate[] = [];

    function collect(node: ParameterOwner): void {
      for (const parameter of node.params) {
        const annotation = typeAnnotationOf(parameter);
        if (annotation === null || annotation === undefined) {
          continue;
        }
        const name = bindingName(parameter, context.sourceCode);
        if (!isTypePredicateSubject(node, name)) {
          candidates.push({
            type: annotation.typeAnnotation,
            name: name,
          });
        }
      }
    }

    return {
      before: function () {
        aliases = [];
        candidates = [];
      },
      TSTypeAliasDeclaration: function (node) {
        aliases.push(node);
      },
      ArrowFunctionExpression: collect,
      FunctionDeclaration: collect,
      FunctionExpression: collect,
      TSCallSignatureDeclaration: collect,
      TSConstructSignatureDeclaration: collect,
      TSConstructorType: collect,
      TSDeclareFunction: collect,
      TSEmptyBodyFunctionExpression: collect,
      TSFunctionType: collect,
      TSMethodSignature: collect,
      // A parameter can name an alias declared further down, so check once all are collected.
      "Program:exit": function () {
        for (const { type, name } of candidates) {
          if (resolvedTypeMatches(type, aliases, isObjectOrUnion)) {
            context.report({
              node: type,
              messageId: "object",
              data: { parameter: name },
            });
          }
        }
      },
    };
  },
};
