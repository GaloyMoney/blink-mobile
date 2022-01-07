/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require("path")
const { getDefaultConfig } = require("metro-config")

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
    },
    projectRoot: path.resolve(__dirname),
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...sourceExts, "svg", "cjs"],
      extraNodeModules: {
        stream: path.resolve(__dirname, "node_modules/readable-stream"),
        zlib: path.resolve(__dirname, "node_modules/browserify-zlib"),
        types: path.resolve(__dirname, "../common/types"),
      },
    },
    maxWorkers: 2,
  }
})()
