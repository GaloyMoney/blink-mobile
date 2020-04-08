import { Alert, Linking } from "react-native"
import InAppBrowser from "react-native-inappbrowser-reborn"

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


// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffle = (array) => {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}