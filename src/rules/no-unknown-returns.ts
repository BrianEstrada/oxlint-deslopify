import type { CreateOnceRule, ESTree } from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import { isUnknownOrUnion, resolvedTypeMatches } from "../utils/type-alias.ts";

type FunctionLike =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

function isPromiseName(name: string): boolean {
  return name === "Promise" || name === "PromiseLike";
}

function isUnknownResult(
  type: ESTree.TSType,
  matches: (child: ESTree.TSType) => boolean,
): boolean {
  if (isUnknownOrUnion(type, matches)) {
    return true;
  }
  if (
    type.type !== "TSTypeReference" ||
    type.typeName.type !== "Identifier" ||
    !isPromiseName(type.typeName.name)
  ) {
    return false;
  }
  const value = type.typeArguments?.params[0];
  return value !== undefined && matches(value);
}

export const noUnknownReturns: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow functions declared to return `unknown` or `Promise<unknown>`; return a parsed type instead.",
      recommended: true,
      url: docsUrl("no-unknown-returns"),
    },
    messages: {
      unknown:
        "This function hands `unknown` to its caller. Parse the value here with a schema (e.g. Zod) and return its type.",
    },
  },
  createOnce: function (context) {
    let aliases: ESTree.TSTypeAliasDeclaration[] = [];
    let returnTypes: ESTree.TSType[] = [];

    function collect(node: FunctionLike): void {
      const annotation = node.returnType;
      if (annotation !== null && annotation !== undefined) {
        returnTypes.push(annotation.typeAnnotation);
      }
    }

    return {
      before: function () {
        aliases = [];
        returnTypes = [];
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
      // A return type can name an alias declared further down, so check once all are collected.
      "Program:exit": function () {
        for (const type of returnTypes) {
          if (resolvedTypeMatches(type, aliases, isUnknownResult)) {
            context.report({
              node: type,
              messageId: "unknown",
            });
          }
        }
      },
    };
  },
};
