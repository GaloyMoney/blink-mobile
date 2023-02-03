module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      {
        globals: ["__scanCodes"],
      },
      "@babel/plugin-proposal-export-namespace-from",
      "react-native-reanimated/plugin",
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
