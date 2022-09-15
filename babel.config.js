module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"],
      },
    ],
    [
      "module-resolver",
      {
        root: ["./app"],
        alias: {
          "^@app/(.+)": "./app/\\1",
        },
      },
    ],
  ],
}
