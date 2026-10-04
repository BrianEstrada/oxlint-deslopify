# deslopify/simple-ternary

Keep ternaries on one line, testing one condition, without interpolated strings.

✅ In `configs.recommended`.

## Why

A ternary reads well when it picks between two plain values. Agents tend to grow them into multi-line chains, compound tests and string builders that are harder to read and review than an `if`/`else` or a named function.

## Rule details

The rule reports a ternary that:

- spans more than one line,
- tests a logical expression (`&&`, `||`, `??`), or
- has a template literal with `${}` as a branch.

Incorrect:

<!-- prettier-ignore -->
```ts
const label =
  count === 1
    ? "one"
    : "many";

const kind = isAdmin && isActive ? "admin" : "user";

const suffix = ok ? ` (${percent}%)` : "";
```

Correct:

```ts
const plural = count === 1 ? "" : "s";

const isActiveAdmin = isAdmin && isActive;
const kind = isActiveAdmin ? "admin" : "user";

let suffix = "";
if (ok) {
  suffix = ` (${percent}%)`;
}
```

A ternary inside a template literal is fine when its branches are plain strings: `` `${n} call${n === 1 ? "" : "s"}` ``.

## Options

None.
