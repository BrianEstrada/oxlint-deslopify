import { defineConfig } from "tsdown";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  entry: "src/index.ts",
  platform: "node",
  dts: true,
});
