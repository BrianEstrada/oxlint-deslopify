# deslopify/no-runtime-typeof

Disallow `typeof` checks outside type guards; parse input with a schema instead.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

Agents scatter `typeof x === "string"` checks through code that receives loosely typed input, instead of parsing it once. Each check narrows one property in one place, and the next function has to check again. A schema (e.g. Zod) at the boundary checks the whole value once and hands back a real type.

## Rule details

The rule reports every runtime `typeof`, except:

- Inside a type guard (`(x): x is T`) or an assertion function (`asserts x is T`), where narrowing is the point. A callback nested inside one doesn't count.
- An existence probe compared with `"undefined"`, like `typeof window === "undefined"`, which asks whether a global exists.

Type-level `typeof`, as in `type Config = typeof config`, isn't a runtime check and is never reported.

Incorrect:

```ts
if (typeof input === "string") {
  use(input);
}

function parse(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("expected a string");
  }
  return value;
}
```

Correct:

```ts
const input = InputSchema.parse(body);

function isString(value: unknown): value is string {
  return typeof value === "string";
}

const isServer = typeof window === "undefined";
```

## Options

None.
