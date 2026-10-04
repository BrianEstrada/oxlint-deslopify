import type { Rule } from "@oxlint/plugins";
import { multilineObject } from "./rules/multiline-object.ts";
import { noGraphQLCast } from "./rules/no-graphql-cast.ts";
import { noPropertyTypeLookup } from "./rules/no-property-type-lookup.ts";
import { simpleTernary } from "./rules/simple-ternary.ts";

export const rules: Record<string, Rule> = {
  "multiline-object": multilineObject,
  "no-graphql-cast": noGraphQLCast,
  "no-property-type-lookup": noPropertyTypeLookup,
  "simple-ternary": simpleTernary,
};
