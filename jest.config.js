module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: [],
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js",
    "\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
  testRegex: "(/__tests__/.*\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  moduleNameMapper: {
    "^@app/(.*)$": ["<rootDir>app/$1"],
    "^@mocks/(.*)$": ["<rootDir>__mocks__/$1"],
    "^@node_modules/(.*)$": ["<rootDir>node_modules/$1"],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native" +
      "|@react-native" +
      "|react-navigation-tabs" +
      "|react-native-animatable" +
      "|react-native-camera" +
      "|react-native-elements" +
      "|react-native-extended-stylesheet" +
      "|react-native-haptic-feedback" +
      "|react-native-image-picker" +
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
