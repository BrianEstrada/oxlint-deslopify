import type { CreateOnceRule } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";

// `T[number]` stays allowed: it's how a const tuple becomes a union.
export const noPropertyTypeLookup: CreateOnceRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        'Disallow looking up a property\'s type with `T["key"]`; name the type instead.',
      recommended: true,
      url: docsUrl("no-property-type-lookup"),
    },
    messages: {
      lookup:
        "Don't look up a property's type with `T[\"{{key}}\"]`. Name that type (an interface, or `z.infer` of its own schema) and use the name.",
    },
  },
  createOnce: function (context) {
    return {
      TSIndexedAccessType: function (node) {
        const { indexType } = node;
        if (
          indexType.type !== "TSLiteralType" ||
          indexType.literal.type !== "Literal"
        ) {
          return;
        }
        const key = indexType.literal.value;
        if (typeof key !== "string") {
          return;
        }
        context.report({
          node: node,
          messageId: "lookup",
          data: { key: key },
        });
      },
    };
  },
};
