import I18n from "i18n-js"
import { OnboardingRewards } from "types"
import InAppBrowser from "react-native-inappbrowser-reborn"
import { Linking, Alert } from "react-native"

/**
 * Convert bytes to a hex encoded string
 * @param  {Buffer|Uint8Array} buf The input as bytes or base64 string
 * @return {string}            The output as hex
 */
export const toHex = (buf) => {
  if (!Buffer.isBuffer(buf) && !(buf instanceof Uint8Array)) {
    throw new Error("Invalid input!")
  }
  return Buffer.from(buf).toString("hex")
}

export const shortenHash = (hash: string, length = 4) => {
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
}

export const emailIsValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const capitalize = (s) => {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const showFundingTx = async (fundingTx) => {
  const url = `https://blockstream.info/testnet/tx/${fundingTx}`

  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: "close",
        // preferredBarTintColor: '#453AA4',
        // preferredControlTintColor: 'white',
        readerMode: false,
        // animated: true,
        modalPresentationStyle: "fullScreen",
        // modalTransitionStyle: 'partialCurl',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        // toolbarColor: '#6200EE',
        secondaryToolbarColor: "black",
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        // animations: {
        //   startEnter: 'slide_in_right',
        //   startExit: 'slide_out_left',
        //   endEnter: 'slide_in_left',
        //   endExit: 'slide_out_right'
        // },
        headers: {
          "my-custom-header": "my custom header value",
        },
      })
      // Alert.alert(JSON.stringify(result))
    } else Linking.openURL(url)
  } catch (error) {
    Alert.alert(error.message)
  }
}

export const plusSats = (balance) =>
  `+${I18n.t("sat", {
    count: balance,
    formatted_number: I18n.toNumber(balance, { precision: 0 }),
  })}`
