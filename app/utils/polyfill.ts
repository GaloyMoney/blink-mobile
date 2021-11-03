import { Platform } from "react-native"

// Polyfill for Intl.NumberFormat.
// See: https://stackoverflow.com/a/55861894
if (Platform.OS === "android") {
  // only android needs polyfill
  require("intl") // import intl object
  require("intl/locale-data/jsonp/en-US") // load the required locale details
}
