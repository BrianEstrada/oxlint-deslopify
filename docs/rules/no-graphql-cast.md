# deslopify/no-graphql-cast

Require `graphql<unknown>` so GraphQL responses are parsed, not cast.

Not in `configs.recommended`: turn it on in projects that call a `graphql()` client such as Octokit's.

## Why

Octokit's `graphql<T>()` only casts the response to `T`; nothing checks the data. Without a type argument it returns `any`, which the `typescript/no-unsafe-*` rules only catch once the value is used. Typing the call as `graphql<unknown>` forces the response through a schema (e.g. Zod) before the code trusts it.

## Rule details

The rule reports any `.graphql(...)` method call that doesn't pass exactly `<unknown>` as its type argument.

Incorrect:

```ts
const data = await github.graphql<{ viewer: { login: string } }>(QUERY);

const data = await github.graphql(QUERY);
```

Correct:

```ts
const data = viewerSchema.parse(await github.graphql<unknown>(QUERY));
```

## Options

None.
