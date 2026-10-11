# deslopify/require-safety-comment-for-type-assertion

Require a `// SAFETY:` comment explaining every type assertion except `as const`.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

An assertion is a claim the compiler can't check. Making the author write down why it holds turns most casts into a schema or a real type, and leaves the rest with a reason a reviewer can verify.

## Rule details

The rule reports an `as` or `<T>` assertion unless a comment before it contains `SAFETY:` followed by text. The comment can sit above the enclosing statement (or its `export`), or inline before the assertion. A chain like `x as unknown as T` needs one comment.

Incorrect:

```ts
const id = value as UserId;

const id = value as UserId; // SAFETY: too late, it must come first.

// SAFETY:
const id = value as UserId;
```

Correct:

```ts
// SAFETY: parseUserId validated the format before branding it.
const id = value as UserId;

const id = /* SAFETY: checked by the guard above. */ value as UserId;

const values = [1, 2] as const;
```

## Options

`markers` sets the words that start a justification. The default is `["SAFETY"]`.

```json
{
  "deslopify/require-safety-comment-for-type-assertion": [
    "error",
    { "markers": ["INVARIANT", "SAFETY"] }
  ]
}
```
