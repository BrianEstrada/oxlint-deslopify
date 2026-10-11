# deslopify/no-module-mocking

Disallow `vi.mock` and `jest.mock`; pass test doubles in through a parameter or interface.

✅ In `configs.recommended` and `configs.opinionated`.

## Why

`vi.mock("./store")` swaps a module for the whole test file. The test passes while the real wiring is broken, it breaks when the module moves, and agents reach for it to avoid designing a seam. Passing the dependency in keeps the test on the code's real interface.

## Rule details

The rule reports `mock`, `doMock` and `unstable_mockModule` called on `vi` or `jest`, whether those are globals or imported from `vitest` or `@jest/globals` (renamed or not). `vi.fn()` and `vi.spyOn()` are allowed, and so is a local variable named `vi` or `jest`.

Incorrect:

```ts
vi.mock("./user-store");

jest.mock("./user-store");

import { vi as testApi } from "vitest";
testApi.doMock("./user-store");
```

Correct:

```ts
const store = new InMemoryUserStore();
const service = new UserService(store);

const save = vi.fn();
const service = createUserService({ save: save });
```

## Options

None.
