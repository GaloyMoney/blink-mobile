module.exports = {
  env: {
    es2021: true,
    "react-native/react-native": true,
  },
  extends: [
    "prettier",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-native/all",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
  },
  plugins: ["react", "react-native", "@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-extra-semi": "off",
  },
  settings: {
    "react-native/style-sheet-object-names": ["EStyleSheet"],
  },
}
