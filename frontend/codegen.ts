import { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
  schema: process.env.SUBGRAPH_URL,
  documents: ["./src/**/*.{ts,tsx}"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
      config: {
        scalars: {
          BigInt: { input: "string", output: "string" },
          Bytes: { input: "string", output: "string" },
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
