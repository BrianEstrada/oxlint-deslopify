# deslopify/no-unknown-returns

Disallow functions declared to return `unknown` or `Promise<unknown>`; return a parsed type instead.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

A function that returns `unknown` passes the job of parsing to every caller, and agents often follow it with a cast. The function that fetches or reads the value is the place to parse it with a schema (e.g. Zod) and return a real type.

## Rule details

The rule reports a declared return type of `unknown`, a union containing it, or `Promise<unknown>` / `PromiseLike<unknown>`. It follows type aliases declared in the same file, including generic ones like `type Id<T> = T`. Inferred return types aren't checked, and neither are aliases imported from other files.

Incorrect:

```ts
function load(): unknown {}

async function fetchUser(): Promise<unknown> {}

type Loader = () => unknown;

type Identity<T> = T;
function load(): Identity<unknown> {}
```

Correct:

```ts
async function fetchUser(): Promise<User> {
  const response = await fetch(url);
  return UserSchema.parse(await response.json());
}

function generic<Value>(): Value {}
```

## Options

None.
