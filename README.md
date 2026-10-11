# oxlint-plugin-deslopify

[Oxlint](https://oxc.rs/docs/guide/usage/linter) rules that keep AI agents from writing sloppy code.

Agents follow a linter more reliably than a style guide in a prompt. This plugin turns the patterns they reach for (multi-line ternaries, one-line objects, `T["key"]` type lookups, unchecked casts) into lint errors. It ships two presets: `recommended` turns on this plugin's rules, and `opinionated` adds Oxlint built-in rules that push the same style further.

## Install

```sh
bun add -d oxlint oxlint-plugin-deslopify
# Only for the type-aware rules in `configs.opinionated`:
bun add -d oxlint-tsgolint
```

## Usage

Extend a preset in `oxlint.config.ts`.

`configs.recommended` turns on this plugin's ✅ rules, plus Oxlint's `oxc/no-accumulating-spread`, the spread half of `no-reduce-accumulator-copy`:

```ts
import { defineConfig } from "oxlint";
import deslopify from "oxlint-plugin-deslopify";

export default defineConfig({
  extends: [deslopify.configs.recommended],
});
```

`configs.opinionated` turns on the same rules plus [the built-in rules below](#what-opinionated-adds):

```ts
import { defineConfig } from "oxlint";
import deslopify from "oxlint-plugin-deslopify";

export default defineConfig({
  extends: [deslopify.configs.opinionated],
  options: {
    // Without this, the preset's type-aware rules are skipped.
    typeAware: true,
  },
});
```

Or load the plugin and pick rules yourself, in `oxlint.config.ts` or `.oxlintrc.json`:

```json
{
  "jsPlugins": ["oxlint-plugin-deslopify"],
  "rules": {
    "deslopify/simple-ternary": "error"
  }
}
```

## Rules

✅ in `configs.recommended` and `configs.opinionated` · 🔧 fixable with `--fix`

| Rule                                                                                                   | Description                                                                                                        | ✅  | 🔧  |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --- | --- |
| [`multiline-object`](docs/rules/multiline-object.md)                                                   | Put each property of an object literal with two or more properties on its own line.                                | ✅  | 🔧  |
| [`no-chained-type-assertions`](docs/rules/no-chained-type-assertions.md)                               | Disallow chained type assertions such as `x as unknown as T`.                                                      | ✅  |     |
| [`no-conditional-empty-object-spread`](docs/rules/no-conditional-empty-object-spread.md)               | Disallow spreading `cond ? { key } : {}` to add a property conditionally.                                          | ✅  |     |
| [`no-graphql-cast`](docs/rules/no-graphql-cast.md)                                                     | Require `graphql<unknown>` so GraphQL responses are parsed, not cast.                                              |     |     |
| [`no-module-mocking`](docs/rules/no-module-mocking.md)                                                 | Disallow `vi.mock` and `jest.mock`; pass test doubles in through a parameter or interface.                         | ✅  |     |
| [`no-object-parameters`](docs/rules/no-object-parameters.md)                                           | Disallow `object` parameters, except a type guard's subject; take the type the function needs instead.             | ✅  |     |
| [`no-property-type-lookup`](docs/rules/no-property-type-lookup.md)                                     | Disallow looking up a property's type with `T["key"]`; name the type instead.                                      | ✅  |     |
| [`no-reduce-accumulator-copy`](docs/rules/no-reduce-accumulator-copy.md)                               | Disallow copying the `reduce` accumulator on every step with `Object.assign({}, acc)`, `acc.concat()` and similar. | ✅  |     |
| [`no-reflect-apply`](docs/rules/no-reflect-apply.md)                                                   | Disallow `Reflect.apply`; call the function directly so its arguments are checked.                                 | ✅  |     |
| [`no-reflect-get`](docs/rules/no-reflect-get.md)                                                       | Disallow `Reflect.get`; read the property directly so its type is checked.                                         | ✅  |     |
| [`no-runtime-typeof`](docs/rules/no-runtime-typeof.md)                                                 | Disallow `typeof` checks outside type guards; parse input with a schema instead.                                   | ✅  |     |
| [`no-unknown-parameters`](docs/rules/no-unknown-parameters.md)                                         | Disallow `unknown` parameters, except a type guard's subject and `cause`; take a parsed type instead.              | ✅  |     |
| [`no-unknown-returns`](docs/rules/no-unknown-returns.md)                                               | Disallow functions declared to return `unknown` or `Promise<unknown>`; return a parsed type instead.               | ✅  |     |
| [`no-unknown-type-aliases`](docs/rules/no-unknown-type-aliases.md)                                     | Disallow type aliases that resolve to `unknown`, such as `type Payload = unknown`.                                 | ✅  |     |
| [`require-safety-comment-for-type-assertion`](docs/rules/require-safety-comment-for-type-assertion.md) | Require a `// SAFETY:` comment explaining every type assertion except `as const`.                                  | ✅  |     |
| [`simple-ternary`](docs/rules/simple-ternary.md)                                                       | Keep ternaries on one line, testing one condition, without interpolated strings.                                   | ✅  |     |

## What `opinionated` adds

Besides the ✅ rules above, `configs.opinionated` sets these built-in Oxlint rules to `"error"`, and turns on Oxlint's `import` plugin for the `import/*` ones. `configs.recommended` leaves them off.

### Slop

Rules against what agents get wrong: `any`, unchecked casts, dead code.

| Rule                                    | Setting                              | Why                                                                                                    |
| --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `typescript/no-explicit-any`            |                                      | `any` turns type checking off. Write the real type, or parse untrusted input with a schema (e.g. Zod). |
| `typescript/consistent-type-assertions` | `objectLiteralTypeAssertions: never` | `{ ... } as T` skips the excess-property check. Write `const x: T = { ... }`.                          |
| `no-nested-ternary`                     |                                      | Catches the one-line `a ? b : c ? d : e` that `simple-ternary` allows.                                 |
| `no-unused-vars`                        | `args`, `caughtErrors: all`          | Unused parameters and swallowed errors, unless prefixed with `_`.                                      |
| `typescript/no-deprecated`              | type-aware                           | Flags `@deprecated` APIs, which `tsc` never reports.                                                   |
| `typescript/no-unsafe-type-assertion`   | type-aware                           | Unchecked casts let unvalidated data through.                                                          |
| `typescript/no-unsafe-assignment`       | type-aware                           | Stops `any` spreading into typed variables.                                                            |
| `typescript/no-unsafe-member-access`    | type-aware                           | Stops property access on `any`.                                                                        |
| `typescript/no-unsafe-argument`         | type-aware                           | Stops `any` being passed as a typed argument.                                                          |

### Tidiness

Style choices, not bugs: each picks one way to write the same code.

| Rule                                     | Setting            | Why                                                                          |
| ---------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `func-style`                             | `declaration`      | Named functions are `function` declarations, not arrows assigned to a const. |
| `object-shorthand`                       | `never`            | `{ key: key }` and `key: function () {}`, never the shorthand.               |
| `curly`                                  | `all`              | Braces on every block body, so extending one is a clean diff.                |
| `arrow-body-style`                       | `always`           | Arrow functions get a block body and an explicit `return`.                   |
| `typescript/consistent-type-definitions` | `interface`        | Object types are interfaces, not type aliases.                               |
| `typescript/consistent-type-imports`     | `type-imports`     | Type-only imports use `import type`.                                         |
| `import/no-duplicates`                   |                    | One import statement per module.                                             |
| `import/consistent-type-specifier-style` | `prefer-top-level` | `import type { A }`, not `import { type A }`.                                |

Override any of them in your own `rules` after `extends`.

## Requirements

- Oxlint 1.86.0 or later. Oxlint's JS plugin support is still in alpha and not covered by semver.
- Node.js `^20.19.0` or `>=22.12.0`.
- `multiline-object`'s fix only adds a newline after `{`. Run [oxfmt](https://oxc.rs/docs/guide/usage/formatter) (or Prettier) with the default `objectWrap: "preserve"` to lay out the rest.

## Development

```sh
bun install
bun run check
```

See [AGENTS.md](AGENTS.md) for how rules are laid out and released.

## License

[MIT](LICENSE)
