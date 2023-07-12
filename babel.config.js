module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./app"],
        alias: {
          "^@app/(.+)": "./app/\\1",
        },
      },
    ],
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"],
      },
    ],
  ],
}
