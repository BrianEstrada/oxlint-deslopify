import { eslintCompatPlugin } from "@oxlint/plugins";
import type { Plugin } from "@oxlint/plugins";
import type { OxlintConfig } from "oxlint";
import { opinionated } from "./opinionated.ts";
import { recommended } from "./recommended.ts";
import { rules } from "./rules.ts";

interface DeslopifyPlugin extends Plugin {
  configs: {
    recommended: OxlintConfig;
    opinionated: OxlintConfig;
  };
}

const plugin: DeslopifyPlugin = {
  ...eslintCompatPlugin({
    meta: { name: "oxlint-plugin-deslopify" },
    rules: rules,
  }),
  configs: {
    recommended: recommended,
    opinionated: opinionated,
  },
};

// noinspection JSUnusedGlobalSymbols
export default plugin;
