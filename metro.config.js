/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require("path")

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  projectRoot: path.resolve(__dirname),
  watchFolders: [__dirname, path.resolve(__dirname, "../common/")],
  resolver: {
    extraNodeModules: {
      stream: path.resolve(__dirname, "node_modules/readable-stream"),
      zlib: path.resolve(__dirname, "node_modules/browserify-zlib"),
      types: path.resolve(__dirname, "../common/types"),
    },
  },
}
