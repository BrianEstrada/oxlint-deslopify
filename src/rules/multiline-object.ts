import type { CreateOnceRule } from "@oxlint/plugins";
import { docsUrl } from "./docs-url.ts";

export const multilineObject: CreateOnceRule = {
  meta: {
    type: "layout",
    docs: {
      description:
        "Put each property of an object literal with two or more properties on its own line.",
      recommended: true,
      url: docsUrl("multiline-object"),
    },
    fixable: "whitespace",
    messages: {
      singleLine: "Put each property of this object on its own line.",
    },
  },
  createOnce: function (context) {
    return {
      ObjectExpression: function (node) {
        if (
          node.properties.length < 2 ||
          node.loc.start.line !== node.loc.end.line
        ) {
          return;
        }
        context.report({
          node: node,
          messageId: "singleLine",
          // oxfmt's default `objectWrap: "preserve"` keeps an object expanded
          // once `{` is followed by a newline, and lays out the rest itself.
          fix: function (fixer) {
            return fixer.insertTextAfterRange(
              [node.range[0], node.range[0] + 1],
              "\n",
            );
          },
        });
      },
    };
  },
};
