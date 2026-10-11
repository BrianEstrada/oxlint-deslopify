# deslopify/no-chained-type-assertions

Disallow chained type assertions such as `x as unknown as T`.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

TypeScript rejects `x as T` when the two types don't overlap. `x as unknown as T` gets past that check, so it's the usual way an agent makes a type error go away without fixing it. The value still has its old shape at runtime.

## Rule details

The rule reports a chain of two or more `as` or `<T>` assertions, through parentheses. A chain made only of `as const` is allowed.

Incorrect:

```ts
const user = input as unknown as User;

const user = input as unknown as User;

const user = <User>(<unknown>input);

const user = { id: 1 } as const as User;
```

Correct:

```ts
const user: User = loadUser();

const user = UserSchema.parse(input);

const values = [1, 2] as const;
```

With type-aware linting on, `typescript/no-unsafe-type-assertion` also reports the narrowing step. This rule needs no type information, so it works under `configs.recommended` too.

## Options

None.
