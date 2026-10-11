import type { ESTree } from "@oxlint/plugins";
import { isStringLiteral } from "./string-literal.ts";

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
