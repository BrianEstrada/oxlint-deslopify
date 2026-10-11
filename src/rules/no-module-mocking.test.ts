import { noModuleMocking } from "./no-module-mocking.ts";
import { ruleTester } from "./rule-tester.ts";

ruleTester.run("no-module-mocking", noModuleMocking, {
  valid: [
    "const store = new InMemoryUserStore();",
    "vi.spyOn(store, 'save');",
    "vi.fn();",
    "const vi = { mock() {} }; vi.mock();",
    "function test(jest: { mock(): void }) { jest.mock(); }",
    "import { vi as localVi } from './helpers'; localVi.mock('./module');",
  ],
  invalid: [
    {
      code: "vi.mock('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "vi.mock" },
        },
      ],
    },
    {
      code: "jest.mock('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "jest.mock" },
        },
      ],
    },
    {
      code: "vi['doMock']('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "vi.doMock" },
        },
      ],
    },
    {
      code: "jest.unstable_mockModule('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "jest.unstable_mockModule" },
        },
      ],
    },
    {
      code: "import { vi } from 'vitest'; vi.mock('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "vi.mock" },
        },
      ],
    },
    {
      code: "import { vi as testApi } from 'vitest'; testApi.mock('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "testApi.mock" },
        },
      ],
    },
    {
      code: "import { jest } from '@jest/globals'; jest.mock('./user-store');",
      errors: [
        {
          messageId: "mock",
          data: { call: "jest.mock" },
        },
      ],
    },
  ],
});
