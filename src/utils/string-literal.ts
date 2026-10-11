import type { ESTree } from "@oxlint/plugins";

// Oxlint gives every literal `type: "Literal"`, so only the value tells a string apart.
export function isStringLiteral(
  node: ESTree.Node,
): node is ESTree.StringLiteral {
  return node.type === "Literal" && typeof node.value === "string";
}
