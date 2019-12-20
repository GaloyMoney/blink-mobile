/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');


module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      stream: path.resolve(__dirname, 'node_modules/readable-stream'),
      zlib: path.resolve(__dirname, 'node_modules/browserify-zlib'),
    }
 },
}
