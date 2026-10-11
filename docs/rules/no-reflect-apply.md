# deslopify/no-reflect-apply

Disallow `Reflect.apply`; call the function directly so its arguments are checked.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

`Reflect.apply(fn, thisArg, args)` takes its arguments as an array, so TypeScript doesn't check them against `fn`'s parameters. A direct call does.

## Rule details

The rule reports calls to the global `Reflect.apply`, including `Reflect["apply"]`. A local variable named `Reflect` is ignored, and so is `fn.apply(...)`.

Incorrect:

```ts
const value = Reflect.apply(operation, owner, args);
```

Correct:

```ts
const value = owner.operation(first, second);

const value = operation.call(owner, first, second);
```

## Options

None.
