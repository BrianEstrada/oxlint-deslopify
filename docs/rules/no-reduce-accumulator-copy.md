# deslopify/no-reduce-accumulator-copy

Disallow copying the `reduce` accumulator on every step with `Object.assign({}, acc)`, `acc.concat()` and similar.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

Copying the accumulator on every step makes `reduce` quadratic: the hundredth step copies ninety-nine entries. The accumulator is a fresh value that the callback owns, so mutating it and returning it is safe.

`configs.opinionated` also turns on Oxlint's `oxc/no-accumulating-spread`, which catches `{ ...acc }` and `[...acc]`. This rule catches the copies that rule misses.

## Rule details

Inside an inline `reduce` or `reduceRight` callback, the rule reports:

- `Object.assign({}, acc, ...)`, with an object literal as the target.
- `Array.from(acc)`.
- `acc.concat()`, `slice()`, `toSpliced()`, `toSorted()`, `toReversed()` and `with()`, when the initial value is visibly an array. That rules out string `concat` and custom collections.

It follows `const` aliases of the accumulator.

Incorrect:

```ts
items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});

items.reduce((acc, item) => acc.concat([item]), []);

items.reduce((acc, item) => {
  const next = acc.slice();
  next.push(item);
  return next;
}, []);
```

Correct:

```ts
items.reduce((acc, item) => {
  acc.push(item);
  return acc;
}, []);

items.reduce((acc, item) => Object.assign(acc, { [item.id]: item }), {});
```

## Options

None.
