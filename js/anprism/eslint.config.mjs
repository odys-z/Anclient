import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([globalIgnores(["**/out", "**/dist", "**/res", "**/*.d.ts"]), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 6,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/naming-convention": "warn",
        "@typescript-eslint/semi": "warn",
        curly: "off",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
    },
}]);