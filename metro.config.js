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
    watchFolders: [__dirname, path.resolve(__dirname, "../common/")],
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"],
      extraNodeModules: {
        types: path.resolve(__dirname, "../common/types"),
      },
    },
  }
})()
