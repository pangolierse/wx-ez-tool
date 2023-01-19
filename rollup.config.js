import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
// import pkg from "./package.json";
export default [
  {
    input: "src/index.ts",
    output: [
      {
        name: "PTool",
        file: "./lib/ptool.js",
        format: "cjs",
      },
      {
        name: "PTool",
        file: "./lib/ptool.esm.js",
        format: "esm",
      },
      {
        name: "PTool",
        file: "./test/lib/ptool.js",
        format: "cjs",
      },
      {
        name: "PTool",
        file: "./test/lib/ptool.esm.js",
        format: "esm",
      },
    ],
    plugins: [
      json(),
      typescript(),
      babel({
        exclude: "node_modules/**",
      }),
    ],
  },
  {
    input: "./types/index.d.ts",
    output: {
      file: "./lib/types/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
];
