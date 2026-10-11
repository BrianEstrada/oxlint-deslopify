# deslopify/no-object-parameters

Disallow `object` parameters, except a type guard's subject; take the type the function needs instead.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

`object` accepts any non-primitive: a `Map`, a `Date`, a function, an array. A function that takes it either doesn't care what it gets, so a narrower type costs nothing, or it reads properties it hasn't declared. When `unknown` is ruled out, `object` is the next type that looks honest but tells the reader nothing.

## Rule details

The rule reports a parameter annotated `object`, or a union containing it, on functions, methods, function types and signatures. It follows type aliases declared in the same file, including generic ones like `type Id<T> = T`.

A type guard's or assertion function's subject is allowed: `value` in `(value: object): value is T`.

Only the parameter's own annotation is checked: `object[]`, `Record<string, object>` and `<T extends object>` aren't reported.

Incorrect:

```ts
function save(value: object) {}

type Payload = object;
const send = (payload: Payload) => {};

function writeFixture(path: string, data: object) {
  return Bun.write(path, JSON.stringify(data));
}
```

Correct:

```ts
function save(value: User) {}

const payload = PayloadSchema.parse(body);
send(payload);

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function writeFixture(path: string, data: Json) {
  return Bun.write(path, JSON.stringify(data));
}

function isUser(value: object): value is User {}
```

In the last example `object` lets through a `Map`, which `JSON.stringify` writes as `{}`. `Json` rejects it.

## Options

None.
