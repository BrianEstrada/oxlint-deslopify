import type {
  CreateOnceRule,
  ESTree,
  Options,
  SourceCode,
} from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";
import { isConstAssertion, isTypeAssertion } from "./type-assertion.ts";
import type { TypeAssertion } from "./type-assertion.ts";

const DEFAULT_MARKERS = ["SAFETY"];

// A comment above one of these covers every assertion inside it.
const STATEMENT_TYPES = new Set([
  "ExpressionStatement",
  "PropertyDefinition",
  "ReturnStatement",
  "ThrowStatement",
  "VariableDeclaration",
]);

function isString(value: Options[number]): value is string {
  return typeof value === "string";
}

interface MarkerOptions {
  markers: string[];
}

// Oxlint checks options against `meta.schema` but types them as plain JSON.
function isMarkerOptions(
  option: Options[number] | undefined,
): option is Options[number] & MarkerOptions {
  return (
    typeof option === "object" &&
    option !== null &&
    "markers" in option &&
    Array.isArray(option.markers) &&
    option.markers.every(isString)
  );
}

function configuredMarkers(option: Options[number] | undefined): string[] {
  if (!isMarkerOptions(option)) {
    return DEFAULT_MARKERS;
  }
  const trimmed = option.markers
    .map(function (marker) {
      return marker.trim();
    })
    .filter(function (marker) {
      return marker !== "";
    });
  if (trimmed.length === 0) {
    return DEFAULT_MARKERS;
  }
  return trimmed;
}

// `SAFETY:` followed by text, not preceded by a word character.
function markerPattern(markers: string[]): RegExp {
  const alternation = markers
    .map(function (marker) {
      return marker.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
    })
    .join("|");
  return new RegExp(
    String.raw`(?:^|[^\p{L}\p{N}_])(?:${alternation})\s*:\s*\S`,
    "u",
  );
}

// In `x as unknown as T`, one comment covers the chain, so check only the outer assertion.
function isInnerAssertion(node: TypeAssertion): boolean {
  let { parent } = node;
  while (parent.type === "ParenthesizedExpression") {
    parent = parent.parent;
  }
  return isTypeAssertion(parent);
}

function hasJustificationBefore(
  sourceCode: SourceCode,
  owner: ESTree.Node,
  assertion: TypeAssertion,
  pattern: RegExp,
): boolean {
  return sourceCode.getCommentsBefore(owner).some(function (comment) {
    return comment.end <= assertion.start && pattern.test(comment.value);
  });
}

// Walk up to the enclosing statement, accepting a comment before any node on the way.
function hasJustification(
  sourceCode: SourceCode,
  assertion: TypeAssertion,
  pattern: RegExp,
): boolean {
  let current: ESTree.Node = assertion;
  while (current.type !== "Program") {
    if (hasJustificationBefore(sourceCode, current, assertion, pattern)) {
      return true;
    }
    if (STATEMENT_TYPES.has(current.type)) {
      const { parent } = current;
      return (
        parent.type === "ExportNamedDeclaration" &&
        hasJustificationBefore(sourceCode, parent, assertion, pattern)
      );
    }
    current = current.parent;
  }
  return false;
}

export const requireSafetyCommentForTypeAssertion: CreateOnceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require a `// SAFETY:` comment explaining every type assertion except `as const`.",
      recommended: true,
      url: docsUrl("require-safety-comment-for-type-assertion"),
    },
    messages: {
      missing:
        "Explain why this assertion is safe in a `// {{marker}}: ...` comment above it, or remove the assertion.",
    },
    schema: [
      {
        type: "object",
        properties: {
          markers: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
            },
            minItems: 1,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce: function (context) {
    let markers = DEFAULT_MARKERS;
    let pattern = markerPattern(markers);

    function check(node: TypeAssertion): void {
      if (isConstAssertion(node) || isInnerAssertion(node)) {
        return;
      }
      if (hasJustification(context.sourceCode, node, pattern)) {
        return;
      }
      context.report({
        node: node,
        messageId: "missing",
        data: { marker: markers[0] },
      });
    }

    return {
      before: function () {
        markers = configuredMarkers(context.options[0]);
        pattern = markerPattern(markers);
      },
      TSAsExpression: check,
      TSTypeAssertion: check,
    };
  },
};
