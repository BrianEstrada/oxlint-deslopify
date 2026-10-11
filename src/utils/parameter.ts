import type { ESTree, SourceCode } from "@oxlint/plugins";

export type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

export function typeAnnotationOf(
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
export function bindingName(
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

export function isTypePredicateSubject(
  owner: ParameterOwner,
  name: string,
): boolean {
  const predicate = owner.returnType?.typeAnnotation;
  return (
    predicate?.type === "TSTypePredicate" &&
    predicate.parameterName.type === "Identifier" &&
    predicate.parameterName.name === name
  );
}
