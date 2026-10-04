# deslopify/no-property-type-lookup

Disallow looking up a property's type with `T["key"]`; name the type instead.

✅ In `configs.recommended`.

## Why

`Foo["bar"]` hides a type that deserves a name. Agents reach for it to avoid declaring a type, and the result is signatures like `Finding["severity"]` that readers have to resolve by hand. Naming the type (an interface, or `z.infer` of its own schema) makes it findable and reusable.

## Rule details

The rule reports an indexed access type whose index is a string literal.

Incorrect:

```ts
type PullRequest = NonNullable<ReviewContext["pullRequest"]>;

type Verdict = z.infer<typeof schema>["verdicts"][number];

function f(severity: Finding["severity"]) {}
```

Correct:

```ts
interface PullRequest {
  number: number;
  title: string;
}

const verdictSchema = z.object({ ok: z.boolean() });
type Verdict = z.infer<typeof verdictSchema>;

function f(severity: Severity) {}
```

These stay allowed:

- `(typeof VALUES)[number]`, which turns a const tuple into a union.
- `Parameters<typeof f>[1]` and other numeric indexes.
- `T[K]` with a type parameter.

## Options

None.
