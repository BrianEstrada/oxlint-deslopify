# deslopify/no-conditional-empty-object-spread

Disallow spreading `cond ? { key } : {}` to add a property conditionally.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

`{ ...(timeout ? { timeout } : {}) }` hides an `if` inside an object literal, and agents stack several of them until the object is hard to read. Building the object and then setting the property in an `if` says the same thing plainly.

## Rule details

The rule reports a spread in an object literal whose argument is a ternary with `{}` as either branch. It has no fix: leaving a key out isn't the same as setting it to `undefined`, so the rewrite needs a person to choose.

Incorrect:

```ts
const options = {
  retries: 3,
  ...(timeout !== undefined ? { timeout } : {}),
};
```

Correct:

```ts
const options: Options = { retries: 3 };
if (timeout !== undefined) {
  options.timeout = timeout;
}
```

Spreads that aren't a ternary with an empty branch, like `...(cond ? a : b)`, are allowed.

## Options

None.
