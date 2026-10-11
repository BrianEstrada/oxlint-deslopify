import type { ESTree } from "@oxlint/plugins";

// Gets the original matcher's recursion, so it can follow aliases inside unions and generics.
type Matcher = (
  type: ESTree.TSType,
  matches: (child: ESTree.TSType) => boolean,
) => boolean;

interface Binding {
  type: ESTree.TSType;
  substitutions: Substitutions;
}

type Substitutions = Map<string, Binding>;

function enclosingBlock(node: ESTree.Node): ESTree.Node {
  let current: ESTree.Node | null = node.parent;
  while (current !== null) {
    if (
      current.type === "Program" ||
      current.type === "BlockStatement" ||
      current.type === "TSModuleBlock" ||
      current.type === "StaticBlock"
    ) {
      return current;
    }
    current = current.parent;
  }
  return node;
}

function distanceTo(ancestor: ESTree.Node, node: ESTree.Node): number | null {
  let current: ESTree.Node | null = node;
  let distance = 0;
  while (current !== null) {
    if (current === ancestor) {
      return distance;
    }
    current = current.parent;
    distance += 1;
  }
  return null;
}

// `function f<T>()` and `{ [K in keyof T]: K }` shadow a module-level `type T` or `type K`.
function isTypeParameter(name: string, use: ESTree.Node): boolean {
  let current: ESTree.Node | null = use;
  while (current !== null) {
    if (current.type === "TSMappedType" && current.key.name === name) {
      return true;
    }
    if ("typeParameters" in current) {
      const params = current.typeParameters?.params ?? [];
      if (
        params.some(function (param) {
          return param.name.name === name;
        })
      ) {
        return true;
      }
    }
    current = current.parent;
  }
  return false;
}

// The nearest alias with this name whose block encloses the use.
function visibleAlias(
  name: string,
  use: ESTree.Node,
  aliases: ESTree.TSTypeAliasDeclaration[],
): ESTree.TSTypeAliasDeclaration | null {
  if (isTypeParameter(name, use)) {
    return null;
  }
  let nearest: ESTree.TSTypeAliasDeclaration | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const alias of aliases) {
    if (alias.id.name !== name) {
      continue;
    }
    const distance = distanceTo(enclosingBlock(alias), use);
    if (distance !== null && distance < nearestDistance) {
      nearest = alias;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function bindArguments(
  alias: ESTree.TSTypeAliasDeclaration,
  reference: ESTree.TSTypeReference,
  outer: Substitutions,
): Substitutions | null {
  const params = alias.typeParameters?.params ?? [];
  const args = reference.typeArguments?.params ?? [];
  const bound: Substitutions = new Map(outer);
  for (const [index, param] of params.entries()) {
    const explicit = args[index];
    if (explicit !== undefined) {
      bound.set(param.name.name, {
        type: explicit,
        substitutions: outer,
      });
      continue;
    }
    if (param.default === null) {
      return null;
    }
    bound.set(param.name.name, {
      type: param.default,
      substitutions: new Map(bound),
    });
  }
  return bound;
}

// Matches `type` after expanding same-file aliases, including generic ones like `type Id<T> = T`.
export function resolvedTypeMatches(
  type: ESTree.TSType,
  aliases: ESTree.TSTypeAliasDeclaration[],
  matcher: Matcher,
): boolean {
  function evaluate(
    current: ESTree.TSType,
    substitutions: Substitutions,
    expanding: Set<ESTree.TSTypeAliasDeclaration>,
  ): boolean {
    if (
      current.type === "TSTypeReference" &&
      current.typeName.type === "Identifier"
    ) {
      const { name } = current.typeName;
      const binding = substitutions.get(name);
      if (binding !== undefined && current.typeArguments === null) {
        return evaluate(binding.type, binding.substitutions, expanding);
      }
      const alias = visibleAlias(name, current, aliases);
      if (alias !== null && !expanding.has(alias)) {
        const bound = bindArguments(alias, current, substitutions);
        if (bound !== null) {
          return evaluate(
            alias.typeAnnotation,
            bound,
            new Set([...expanding, alias]),
          );
        }
      }
    }
    return matcher(current, function (child) {
      return evaluate(child, substitutions, expanding);
    });
  }
  return evaluate(type, new Map(), new Set());
}

export function isUnknownOrUnion(
  type: ESTree.TSType,
  matches: (child: ESTree.TSType) => boolean,
): boolean {
  if (type.type === "TSUnknownKeyword") {
    return true;
  }
  if (type.type === "TSParenthesizedType") {
    return matches(type.typeAnnotation);
  }
  return type.type === "TSUnionType" && type.types.some(matches);
}
