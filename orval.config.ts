import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "./openapi/openapi.json",
    },
    output: {
      mode: "split",
      target: "./src/gen/clients",
      schemas: "./src/gen/schemas",
      client: "fetch",
      baseUrl: "${process.env.API_URL}",
      clean: true,
      override: {
        mutator: {
          path: "./src/fetcher.ts",
          name: "fetcher",
        },
      },
    },
    hooks: {
      // afterAllFilesWrite: "biome check --write --unsafe",
    },
  },
  // apiHono: {
  //   input: {
  //     target: "./api.json",
  //   },
  //   output: {
  //     mode: "split",
  //     client: "hono",
  //     clean: true,
  //     target: "./src/orval/gen/api.ts",
  //     schemas: "./src/orval/gen/schemas",
  //     override: {
  //       hono: {
  //         handlers: "src/orval/gen/handlers",
  //       },
  //     },
  //   },
  //   hooks: {
  //     afterAllFilesWrite: "biome check --write ./src/orval/gen",
  //   },
  // },
  // apiZod: {
  //   input: {
  //     target: "./api.json",
  //   },
  //   output: {
  //     mode: "tags-split",
  //     target: "./src/orval/gen/clients",
  //     client: "zod",
  //     fileExtension: ".zod.ts",
  //     override: {
  //       zod: {
  //         generate: {
  //           param: true,
  //           query: true,
  //           header: true,
  //           body: true,
  //           response: true,
  //         },
  //         generateEachHttpStatus: true,
  //       },
  //     },
  //   },
  //   hooks: {
  //     // afterAllFilesWrite: "biome check --write --unsafe",
  //   },
  // },
});
