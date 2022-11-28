import pluginTerser from "rollup-plugin-terser";
import pluginReplace from "@rollup/plugin-replace";
/** @type {import('rollup').RollupOptions} */
const config = {
  input: {
    "index.browser.esm.min": "./dist/index.js",
    "core.browser.esm.min": "./dist/core.js",
    "hooks.browser.esm.min": "./dist/hooks.js",
    "jsx-runtime.browser.esm.min": "./dist/jsx-runtime.js",
    "store.browser.esm.min": "./dist/store.js",
    "template.browser.esm.min": "./dist/template.js",
  },
  external: [],
  plugins: [
    pluginReplace({
      preventAssignment: true,
      "process.env.NODE_ENV": "'production'",
    }),
  ],
  output: {
    format: "esm",
    dir: "dist",
    plugins: [pluginTerser.terser()],
  },
};
export default config;
