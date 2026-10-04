import type { AllowWarnDeny, OxlintConfig } from "oxlint";
import { rules } from "./rules.ts";

const recommendedRules: Record<string, AllowWarnDeny> = Object.fromEntries(
  Object.entries(rules)
    .filter(([, rule]) => {
      return rule.meta?.docs?.recommended === true;
    })
    .map(([name]) => {
      return [`deslopify/${name}`, "error"];
    }),
);

export const recommended: OxlintConfig = {
  jsPlugins: ["oxlint-plugin-deslopify"],
  rules: recommendedRules,
};
