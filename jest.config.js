module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: [
    "<rootDir>/__mocks__/global-mock.js",
    "<rootDir>/__mocks__/react-native-firebase.js",
    "<rootDir>/__mocks__/react-native-keychain.js",
    "@testing-library/jest-native/extend-expect"
  ],
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js",
    "\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native" +
      "|@react-native" +
      "|react-navigation-tabs" +
      "|react-native-animatable" +
      "|react-native-elements" +
      "|react-native-extended-stylesheet" +
      "|react-native-haptic-feedback" +
      "|react-native-modal" +
      "|react-native-splash-screen" +
      "|react-native-screens" +
      "|react-native-size-matters" +
      "|react-native-ratings" +
      "|react-native-reanimated" +
      "|react-native-vector-icons" +
      "|@react-native-firebase/auth" +
      "|@react-native-firebase" +
      ")/)",
  ],
}
