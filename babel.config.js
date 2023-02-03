module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "@babel/plugin-proposal-export-namespace-from",
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
