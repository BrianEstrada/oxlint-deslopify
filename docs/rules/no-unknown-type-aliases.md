# deslopify/no-unknown-type-aliases

Disallow type aliases that resolve to `unknown`, such as `type Payload = unknown`.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

`type Payload = unknown` looks like a real type at every use, so `no-unknown-parameters` and `no-unknown-returns` would have to see through it. Name the real type, or parse with a schema (e.g. Zod) and use its inferred type.

## Rule details

The rule reports an alias whose type is `unknown`, a union containing it, or another same-file alias that resolves to one, including generic aliases like `Identity<unknown>`. Types that only contain `unknown`, like `unknown[]` or `Box<unknown>`, aren't reported.

Incorrect:

```ts
type Payload = unknown;

type Response = string | unknown;

type Identity<T> = T;
type Payload = Identity<unknown>;
```

Correct:

```ts
interface Payload {
  id: string;
}

type Payload = z.infer<typeof PayloadSchema>;
```

## Options

None.
