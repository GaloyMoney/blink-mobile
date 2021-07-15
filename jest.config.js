module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js",
    "\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.jest.json",
    },
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native" +
      "|@react-native" +
      "|react-navigation-tabs" +
      "|react-native-splash-screen" +
      "|react-native-screens" +
      "|react-native-reanimated" +
      "|@react-native-firebase/auth" +
      "|@react-native-firebase" +
      ")/)",
  ],
}
