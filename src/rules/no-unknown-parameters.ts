import type { CreateOnceRule, ESTree, SourceCode } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";

type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

export function containsUnknown(type: ESTree.TSType): boolean {
  if (type.type === "TSUnknownKeyword") {
    return true;
  }
  if (type.type === "TSParenthesizedType") {
    return containsUnknown(type.typeAnnotation);
  }
  return type.type === "TSUnionType" && type.types.some(containsUnknown);
}

function typeAnnotationOf(
  parameter: ESTree.ParamPattern,
): ESTree.TSTypeAnnotation | null | undefined {
  if (parameter.type === "TSParameterProperty") {
    return typeAnnotationOf(parameter.parameter);
  }
  if (parameter.type === "RestElement") {
    return parameter.typeAnnotation ?? typeAnnotationOf(parameter.argument);
  }
  if (parameter.type === "AssignmentPattern") {
    return parameter.typeAnnotation ?? typeAnnotationOf(parameter.left);
  }
  return parameter.typeAnnotation;
}

// The binding as written, without its annotation or default.
function bindingName(
  parameter: ESTree.ParamPattern,
  sourceCode: SourceCode,
): string {
  if (parameter.type === "TSParameterProperty") {
    return bindingName(parameter.parameter, sourceCode);
  }
  if (parameter.type === "AssignmentPattern") {
    return bindingName(parameter.left, sourceCode);
  }
  if (parameter.type === "RestElement") {
    return bindingName(parameter.argument, sourceCode);
  }
  if (parameter.type === "Identifier") {
    return parameter.name;
  }
  const text = sourceCode.getText(parameter);
  const annotationStart = parameter.typeAnnotation?.start;
  if (annotationStart === undefined) {
    return text;
  }
  return text.slice(0, annotationStart - parameter.start).trimEnd();
}

function isTypePredicateSubject(owner: ParameterOwner, name: string): boolean {
  const predicate = owner.returnType?.typeAnnotation;
  return (
    predicate?.type === "TSTypePredicate" &&
    predicate.parameterName.type === "Identifier" &&
    predicate.parameterName.name === name
  );
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
