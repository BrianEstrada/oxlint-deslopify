import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";
import { isStringLiteral } from "./string-literal.ts";

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

interface StaticMember {
  name: string;
  object: ESTree.Expression;
}

// Reads `object.name` and `object["name"]`.
export function staticMemberName(
  callee: ESTree.Expression,
): StaticMember | null {
  if (callee.type !== "MemberExpression") {
    return null;
  }
  const { property } = callee;
  if (!callee.computed && property.type === "Identifier") {
    return {
      name: property.name,
      object: callee.object,
    };
  }
  if (callee.computed && isStringLiteral(property)) {
    return {
      name: property.value,
      object: callee.object,
    };
  }
  return null;
}
