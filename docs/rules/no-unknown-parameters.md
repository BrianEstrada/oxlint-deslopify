# deslopify/no-unknown-parameters

Disallow `unknown` parameters, except a type guard's subject and `cause`; take a parsed type instead.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

A function that takes `unknown` pushes parsing into its body, so every caller can pass anything and the function has to check it piece by piece. Parse once at the boundary with a schema (e.g. Zod), and let the function take the type the schema produces.

## Rule details

The rule reports a parameter annotated `unknown`, or a union containing it, on functions, methods, function types and signatures. Two parameters are allowed:

- The subject of a type guard or assertion function: `value` in `(value: unknown): value is T`.
- A parameter named `cause`, which mirrors `Error`'s own `cause: unknown`.

Only the parameter's own annotation is checked: `unknown[]` and `Record<string, unknown>` aren't reported.

Incorrect:

```ts
function handle(input: unknown) {}

const onMessage = (event: unknown) => {};

function isUser(value: unknown, context: unknown): value is User {}
```

Correct:

```ts
function handle(input: Input) {}

const input = InputSchema.parse(body);
handle(input);

function isUser(value: unknown): value is User {}

function wrap(cause: unknown): Error {}
```

## Options

None.
