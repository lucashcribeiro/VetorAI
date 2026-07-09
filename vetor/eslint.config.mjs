import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "core/db/generated/**",
    ],
  },
  // ADR-001/ADR-002 — fronteiras do monólito modular.
  // A fronteira que no microserviço é a rede, aqui é o linter: falha o build.
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },
      "boundaries/include": ["modules/**/*", "core/**/*", "app/**/*"],
      "boundaries/elements": [
        // contrato compartilhado (types.ts, registry.ts) — arquivos soltos em modules/
        { type: "modules-contract", pattern: "modules/*.(ts|tsx)", mode: "file" },
        { type: "module", pattern: "modules/*", capture: ["moduleName"] },
        { type: "core", pattern: "core/**" },
        { type: "app", pattern: "app/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: [{ type: "module" }],
              disallow: [{ type: "module", moduleName: "!{{from.moduleName}}" }],
              message:
                "Módulo não importa de outro módulo (ADR-002). Suba o código para core/ ou comunique via tabela de eventos.",
            },
            {
              from: [{ type: "core" }],
              disallow: [{ type: "module" }, { type: "app" }],
              message: "core/ não conhece modules/ nem app/.",
            },
            {
              from: [{ type: "modules-contract" }],
              disallow: [{ type: "app" }],
              message: "O contrato de módulos não importa de app/.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
