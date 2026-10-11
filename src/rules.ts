import type { Rule } from "@oxlint/plugins";
import { multilineObject } from "./rules/multiline-object.ts";
import { noChainedTypeAssertions } from "./rules/no-chained-type-assertions.ts";
import { noConditionalEmptyObjectSpread } from "./rules/no-conditional-empty-object-spread.ts";
import { noGraphQLCast } from "./rules/no-graphql-cast.ts";
import { noModuleMocking } from "./rules/no-module-mocking.ts";
import { noPropertyTypeLookup } from "./rules/no-property-type-lookup.ts";
import { noReduceAccumulatorCopy } from "./rules/no-reduce-accumulator-copy.ts";
import { noReflectApply } from "./rules/no-reflect-apply.ts";
import { noReflectGet } from "./rules/no-reflect-get.ts";
import { noRuntimeTypeof } from "./rules/no-runtime-typeof.ts";
import { noUnknownParameters } from "./rules/no-unknown-parameters.ts";
import { noUnknownReturns } from "./rules/no-unknown-returns.ts";
import { noUnknownTypeAliases } from "./rules/no-unknown-type-aliases.ts";
import { requireSafetyCommentForTypeAssertion } from "./rules/require-safety-comment-for-type-assertion.ts";
import { simpleTernary } from "./rules/simple-ternary.ts";

export const rules: Record<string, Rule> = {
  "multiline-object": multilineObject,
  "no-chained-type-assertions": noChainedTypeAssertions,
  "no-conditional-empty-object-spread": noConditionalEmptyObjectSpread,
  "no-graphql-cast": noGraphQLCast,
  "no-module-mocking": noModuleMocking,
  "no-property-type-lookup": noPropertyTypeLookup,
  "no-reduce-accumulator-copy": noReduceAccumulatorCopy,
  "no-reflect-apply": noReflectApply,
  "no-reflect-get": noReflectGet,
  "no-runtime-typeof": noRuntimeTypeof,
  "no-unknown-parameters": noUnknownParameters,
  "no-unknown-returns": noUnknownReturns,
  "no-unknown-type-aliases": noUnknownTypeAliases,
  "require-safety-comment-for-type-assertion":
    requireSafetyCommentForTypeAssertion,
  "simple-ternary": simpleTernary,
};
