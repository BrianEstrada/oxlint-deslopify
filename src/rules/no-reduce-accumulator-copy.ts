import type {
  CreateOnceRule,
  ESTree,
  SourceCode,
  Variable,
} from "@oxlint/plugins";
import { docsUrl } from "../utils/docs-url.ts";
import { isUnshadowedGlobal, resolveVariable } from "../utils/scope.ts";
import { staticMemberName } from "../utils/member-expression.ts";

const ARRAY_COPY_METHODS = new Set([
  "concat",
  "slice",
  "toSpliced",
  "toSorted",
  "toReversed",
  "with",
]);

// Methods that return a new array when called on one.
const ARRAY_RETURNING_METHODS = new Set([
  ...ARRAY_COPY_METHODS,
  "map",
  "filter",
  "flatMap",
]);

interface Reducer {
  callback: ESTree.Function | ESTree.ArrowFunctionExpression;
  accumulator: ESTree.BindingIdentifier;
  initialValue: ESTree.Node | undefined;
}

function unwrap(node: ESTree.Node): ESTree.Node {
  let current = node;
  while (
    current.type === "ParenthesizedExpression" ||
    current.type === "ChainExpression" ||
    current.type === "TSAsExpression" ||
    current.type === "TSTypeAssertion" ||
    current.type === "TSNonNullExpression" ||
    current.type === "TSSatisfiesExpression"
  ) {
    current = current.expression;
  }
  return current;
}

function resolveBinding(
  sourceCode: SourceCode,
  node: ESTree.Node,
): Variable | null {
  const identifier = unwrap(node);
  if (identifier.type !== "Identifier") {
    return null;
  }
  return resolveVariable(sourceCode, identifier);
}

// The initializer of a `const` that is never reassigned, so aliases can be followed.
function constInitializer(variable: Variable): ESTree.Expression | null {
  const reassigned = variable.references.some(function (reference) {
    return reference.isWrite() && !reference.init;
  });
  if (reassigned) {
    return null;
  }
  for (const definition of variable.defs) {
    const declarator = definition.node;
    if (
      definition.type === "Variable" &&
      declarator.type === "VariableDeclarator" &&
      declarator.id.type === "Identifier" &&
      declarator.init !== null &&
      declarator.parent.type === "VariableDeclaration" &&
      declarator.parent.kind === "const"
    ) {
      return declarator.init;
    }
  }
  return null;
}

function isArrayAnnotation(type: ESTree.TSType): boolean {
  if (type.type === "TSArrayType" || type.type === "TSTupleType") {
    return true;
  }
  if (type.type === "TSParenthesizedType") {
    return isArrayAnnotation(type.typeAnnotation);
  }
  if (type.type === "TSTypeOperator" && type.operator === "readonly") {
    return isArrayAnnotation(type.typeAnnotation);
  }
  return (
    type.type === "TSTypeReference" &&
    type.typeName.type === "Identifier" &&
    (type.typeName.name === "Array" || type.typeName.name === "ReadonlyArray")
  );
}

// Only local evidence: `[]`, array methods on one, or a binding typed or initialized as one.
function isKnownArray(
  sourceCode: SourceCode,
  node: ESTree.Node,
  visited: Set<Variable>,
): boolean {
  const expression = unwrap(node);
  if (expression.type === "ArrayExpression") {
    return true;
  }
  if (expression.type === "CallExpression") {
    const method = staticMemberName(expression.callee);
    return (
      method !== null &&
      ARRAY_RETURNING_METHODS.has(method.name) &&
      isKnownArray(sourceCode, method.object, visited)
    );
  }
  const variable = resolveBinding(sourceCode, expression);
  if (variable === null || visited.has(variable)) {
    return false;
  }
  visited.add(variable);
  for (const identifier of variable.identifiers) {
    const annotation = identifier.typeAnnotation?.typeAnnotation;
    if (annotation !== undefined) {
      return isArrayAnnotation(annotation);
    }
  }
  const init = constInitializer(variable);
  return init !== null && isKnownArray(sourceCode, init, visited);
}

// The inline `reduce` callback a call sits in, stopping at any other function.
function enclosingReducer(node: ESTree.Node): Reducer | null {
  let { parent } = node;
  while (parent !== null) {
    if (parent.type === "FunctionDeclaration") {
      return null;
    }
    if (
      parent.type === "ArrowFunctionExpression" ||
      parent.type === "FunctionExpression"
    ) {
      return reducerOf(parent);
    }
    parent = parent.parent;
  }
  return null;
}

function reducerOf(
  callback: ESTree.Function | ESTree.ArrowFunctionExpression,
): Reducer | null {
  let owner: ESTree.Node | null = callback.parent;
  while (owner !== null && unwrap(owner) === callback) {
    owner = owner.parent;
  }
  if (owner?.type !== "CallExpression") {
    return null;
  }
  const method = staticMemberName(owner.callee);
  const [first, initialValue] = owner.arguments;
  if (
    method === null ||
    (method.name !== "reduce" && method.name !== "reduceRight") ||
    owner.arguments.length > 2 ||
    first === undefined ||
    unwrap(first) !== callback
  ) {
    return null;
  }
  let [accumulator] = callback.params;
  if (accumulator?.type === "AssignmentPattern") {
    accumulator = accumulator.left;
  }
  if (accumulator?.type !== "Identifier") {
    return null;
  }
  return {
    callback: callback,
    accumulator: accumulator,
    initialValue: initialValue,
  };
}

function refersTo(
  sourceCode: SourceCode,
  node: ESTree.Node,
  accumulator: Variable,
  visited: Set<Variable>,
): boolean {
  const variable = resolveBinding(sourceCode, node);
  if (variable === null || visited.has(variable)) {
    return false;
  }
  if (variable === accumulator) {
    return true;
  }
  visited.add(variable);
  const init = constInitializer(variable);
  return init !== null && refersTo(sourceCode, init, accumulator, visited);
}

export const noReduceAccumulatorCopy: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow copying the `reduce` accumulator on every step with `Object.assign({}, acc)`, `acc.concat()` and similar.",
      recommended: true,
      url: docsUrl("no-reduce-accumulator-copy"),
    },
    messages: {
      copy: "This copies the accumulator on every step, which is quadratic. Push or assign into the accumulator and return it, or use `flatMap`.",
    },
  },
  createOnce: function (context) {
    function copiesAccumulator(
      sourceCode: SourceCode,
      node: ESTree.CallExpression,
      reducer: Reducer,
      accumulator: Variable,
    ): boolean {
      const method = staticMemberName(node.callee);
      if (method === null) {
        return false;
      }
      function isAccumulator(argument: ESTree.Node): boolean {
        return refersTo(sourceCode, argument, accumulator, new Set());
      }
      if (
        method.name === "assign" &&
        isUnshadowedGlobal(sourceCode, method.object, "Object")
      ) {
        const [target, ...sources] = node.arguments;
        return (
          target !== undefined &&
          unwrap(target).type === "ObjectExpression" &&
          sources.some(isAccumulator)
        );
      }
      if (
        method.name === "from" &&
        isUnshadowedGlobal(sourceCode, method.object, "Array")
      ) {
        const [source] = node.arguments;
        return source !== undefined && isAccumulator(source);
      }
      // String `concat` and custom collections share these names, so require an array seed.
      return (
        ARRAY_COPY_METHODS.has(method.name) &&
        reducer.initialValue !== undefined &&
        isKnownArray(sourceCode, reducer.initialValue, new Set()) &&
        isAccumulator(method.object)
      );
    }

    return {
      CallExpression: function (node) {
        const reducer = enclosingReducer(node);
        if (reducer === null) {
          return;
        }
        const { sourceCode } = context;
        const accumulator = sourceCode
          .getDeclaredVariables(reducer.callback)
          .find(function (variable) {
            // Compare offsets: oxlint may hand out different objects for one node.
            return variable.identifiers.some(function (identifier) {
              return identifier.start === reducer.accumulator.start;
            });
          });
        if (
          accumulator === undefined ||
          !copiesAccumulator(sourceCode, node, reducer, accumulator)
        ) {
          return;
        }
        context.report({
          node: node,
          messageId: "copy",
        });
      },
    };
  },
};
