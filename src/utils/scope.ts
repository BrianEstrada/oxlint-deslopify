import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

export function resolveVariable(
  sourceCode: SourceCode,
  identifier: ESTree.Node & { name: string },
): Variable | null {
  let scope: Scope | null = sourceCode.getScope(identifier);
  while (scope !== null) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined) {
      return variable;
    }
    scope = scope.upper;
  }
  return null;
}

// An unresolved name, or one with no declarations, is a global that nothing shadows.
export function isUnshadowedGlobal(
  sourceCode: SourceCode,
  expression: ESTree.Expression,
  name: string,
): expression is ESTree.IdentifierReference {
  if (expression.type !== "Identifier" || expression.name !== name) {
    return false;
  }
  if (sourceCode.isGlobalReference(expression)) {
    return true;
  }
  const variable = resolveVariable(sourceCode, expression);
  return variable === null || variable.defs.length === 0;
}
