/**
 * @fileOverview action to handle secure key storage to platform apis.
 */

import * as RNKeychain from "react-native-keychain"

const VERSION = "0"
const USER = "lightning"

class KeychainAction {
  /**
   * Store an item in the keychain.
   * @param {string} key   The key by which to do a lookup
   * @param {string} value The value to be stored
   * @return {Promise<undefined>}
   */
  async setItem(key: string, value: string): Promise<false | RNKeychain.Result> {
    const options = {
      accessible: RNKeychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      // accessControl: RNKeychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
      // TODO figure out why this doesn't work
      // may be related to https://github.com/oblador/react-native-keychain/issues/182

      // maybe we can replace react-native-keychain with https://mcodex.dev/react-native-sensitive-info/docs/protectingWithFingerprint
    }
    const vKey = `${VERSION}_${key}`
    return RNKeychain.setInternetCredentials(vKey, USER, value, options)
  }

  /**
   * Read an item stored in the keychain.
   * @param  {string} key      The key by which to do a lookup.
   * @return {Promise<string>} The stored value
   */
  async getItem(key: string): Promise<string | null> {
    const vKey = `${VERSION}_${key}`
    const credentials = await RNKeychain.getInternetCredentials(vKey)
    if (credentials) {
      return credentials.password
    }
    return null
  }
}

export default KeychainAction
