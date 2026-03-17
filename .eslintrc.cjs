module.exports = {
  root: true,

  parser: "@typescript-eslint/parser",

  parserOptions: {
    project: "./tsconfig.eslint.json",
    tsconfigRootDir: __dirname
  },

  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import",
    "unused-imports"
  ],

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",

    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",

    "plugin:import/recommended",
    "plugin:import/typescript"
  ],

  settings: {
    react: {
      version: "detect"
    },

    "import/resolver": {
      typescript: {}
    }
  },

  rules: {

    /*
    -------------------------
    TypeScript
    -------------------------
    */

    "@typescript-eslint/consistent-type-imports": "error",

    "@typescript-eslint/no-floating-promises": "error",

    "@typescript-eslint/no-misused-promises": "error",

    "@typescript-eslint/no-unnecessary-type-assertion": "error",

    "@typescript-eslint/no-unused-vars": "off",

    /*
    -------------------------
    Imports
    -------------------------
    */

    "unused-imports/no-unused-imports": "error",

    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ],

    /*
    -------------------------
    React
    -------------------------
    */

    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
};