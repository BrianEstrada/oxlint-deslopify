# deslopify/no-reflect-get

Disallow `Reflect.get`; read the property directly so its type is checked.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

`Reflect.get(owner, key)` returns `any` and accepts any key, so it compiles where `owner[key]` wouldn't. Agents use it to read properties the types say aren't there.

## Rule details

The rule reports calls to the global `Reflect.get`, including `Reflect["get"]`. A local variable named `Reflect` is ignored.

Incorrect:

```ts
const value = Reflect.get(owner, key);
```

Correct:

```ts
const value = owner.property;

const value = owner[key];

const config = ConfigSchema.parse(input);
const value = config.timeout;
```

## Options

None.
