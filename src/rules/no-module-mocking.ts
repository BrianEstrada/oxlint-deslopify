import type { CreateOnceRule, ESTree, SourceCode } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";
import { resolveVariable, staticMemberName } from "./scope.ts";

const MOCK_METHODS = new Set(["mock", "doMock", "unstable_mockModule"]);

const FRAMEWORK_EXPORTS = new Map([
  ["vitest", "vi"],
  ["@jest/globals", "jest"],
]);

function importedName(specifier: ESTree.Node): string | null {
  if (specifier.type !== "ImportSpecifier") {
    return null;
  }
  if (specifier.imported.type === "Identifier") {
    return specifier.imported.name;
  }
  return specifier.imported.value;
}

// `vi` and `jest` as globals, or imported (maybe renamed) from their packages.
function isMockingApi(
  sourceCode: SourceCode,
  expression: ESTree.Expression,
): expression is ESTree.IdentifierReference {
  if (expression.type !== "Identifier") {
    return false;
  }
  const isGlobalName = expression.name === "vi" || expression.name === "jest";
  const variable = resolveVariable(sourceCode, expression);
  if (variable === null || variable.defs.length === 0) {
    return isGlobalName;
  }
  return variable.defs.some(function (definition) {
    const declaration = definition.parent;
    if (
      definition.type !== "ImportBinding" ||
      declaration?.type !== "ImportDeclaration"
    ) {
      return false;
    }
    const expected = FRAMEWORK_EXPORTS.get(declaration.source.value);
    return expected !== undefined && importedName(definition.node) === expected;
  });
}

export const noModuleMocking: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `vi.mock` and `jest.mock`; pass test doubles in through a parameter or interface.",
      recommended: true,
      url: docsUrl("no-module-mocking"),
    },
    messages: {
      mock: "Don't mock modules with `{{call}}`. Pass the dependency in (a parameter, constructor argument or interface) and give the test a fake.",
    },
  },
  createOnce: function (context) {
    return {
      CallExpression: function (node) {
        if (node.callee.type === "Super") {
          return;
        }
        const member = staticMemberName(node.callee);
        if (
          member === null ||
          !MOCK_METHODS.has(member.name) ||
          !isMockingApi(context.sourceCode, member.object)
        ) {
          return;
        }
        context.report({
          node: node,
          messageId: "mock",
          data: { call: `${member.object.name}.${member.name}` },
        });
      },
    };
  },
};
