<!--
AGENTS.md strategy: this file is for coding agents, and it's loaded into every session, so every line costs tokens.
- Include only what an agent can't learn from the code or config and would otherwise get wrong.
- Write imperative, specific rules ("use X, not Y") with exact commands. Leave out overviews and rationale.
- Don't restate what tooling already enforces (lint, format, hooks) or what package.json scripts already show.
- Add a rule when an agent makes a real mistake, and delete rules that no longer earn their place. Keep it under about 40 lines.
- Human-facing docs go in README.md.
-->

# oxlint-plugin-deslopify

## Rules

- Use Bun to install and run scripts (`bun`, `bun run`, `bunx`), not npm. The one exception is `npm publish` in the release workflow.
- Run tests with `bun run test`, never `bun test`: oxlint's `RuleTester` refuses Bun, so tests run on Node.
- A rule is `src/rules/<name>.ts` exporting a `CreateOnceRule`, plus `<name>.test.ts` beside it using `ruleTester` from `src/rules/rule-tester.ts`, plus `docs/rules/<name>.md`. Register it in `src/rules.ts` and add it to the README's rules table.
- Write `createOnce`, not `create`. It runs once per lint run, so keep no per-file state in its closure; reset any in a `before` hook.
- Give every rule `meta.docs` with `description`, `recommended` and `url: docsUrl("<name>")`. `recommended: true` adds it to both `configs.recommended` and `configs.opinionated`; keep rules tied to one library or project `false`. Built-in Oxlint rules go only in `configs.opinionated` (`src/opinionated.ts`).
- Put a two-line comment above every built-in rule in `src/opinionated.ts`: `// Example: <code it flags>`, then `// <what's wrong or what to write instead>`. File it under `slopRules` (catches mistakes) or `tidinessRules` (picks one style).
- This package is public: rule messages and docs must not name any one project's helpers.

## Comments

Before writing or keeping a comment or JSDoc block, walk this:

1. Can a reader derive it from the code, names, types or test name? Then don't write it. Don't restate a signature in `@param`/`@returns` either; the types already say it.
2. Is there a hidden reason, constraint or exception (an API quirk, a rate limit, a race, why _not_ the obvious approach)? Document that fact only, not what the code does.
3. Keep it to 1 line, 2 at most. Go longer only with a very good reason.

## Checks

- Run `bun run check` and make it pass before you commit.
- Lint has zero tolerance for warnings. Fix the code. Don't disable a rule or downgrade it to `"warn"`.
- Don't bypass the git hooks (`--no-verify`, `LEFTHOOK=0`).
- Write commit messages as Conventional Commits: `<type>(<scope>): <description>`, e.g. `feat(rules): add no-foo`.
- The repo lints itself with `src/index.ts`. Smoke-test a rule by linting a file that breaks it: `bunx oxlint <file>`.

## Releasing

- Bump `version` in `package.json` in a `chore(release): vX.Y.Z` commit on `main`, then push a `vX.Y.Z` tag. The Release workflow publishes to npm. Don't run `npm publish` locally.

## PRs

- Title: a Conventional Commit, like the commit messages.
- If you add a rule or change a preset, update `README.md` and the preset line at the top of the rule's `docs/rules/<name>.md`.
