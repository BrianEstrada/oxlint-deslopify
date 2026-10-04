# deslopify/multiline-object

Put each property of an object literal with two or more properties on its own line.

✅ In `configs.recommended` and `configs.opinionated`. 🔧 Fixable with `--fix`.

## Why

One property per line keeps diffs to the line that changed, and stops agents packing a whole object onto one line where a changed value is easy to miss in review.

## Rule details

The rule reports an object expression with two or more properties that starts and ends on the same line. Empty objects and objects with one property are allowed.

Incorrect:

```ts
const part = { type: "text", text: "hi" };
```

Correct:

```ts
const part = {
  type: "text",
  text: "hi",
};

const response = { status: 502 };
```

## Fix

The fix only inserts a newline after `{`. [oxfmt](https://oxc.rs/docs/guide/usage/formatter)'s default `objectWrap: "preserve"` then keeps the object expanded and puts each property on its own line. Run the formatter after `oxlint --fix`. Prettier's `objectWrap: "preserve"` behaves the same way.

## Options

None.
