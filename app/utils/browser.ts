import InAppBrowser from "react-native-inappbrowser-reborn"
import { sleep } from "./sleep"
import { Alert, Linking } from "react-native"

export const openKycBrowser = async () => {
  try {
    const url = "http://localhost:5173/"
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: "cancel",
        preferredBarTintColor: "#453AA4",
        preferredControlTintColor: "white",
        readerMode: false,
        animated: true,
        modalPresentationStyle: "fullScreen",
        modalTransitionStyle: "coverVertical",
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: "#6200EE",
        secondaryToolbarColor: "black",
        navigationBarColor: "black",
        navigationBarDividerColor: "white",
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: "slide_in_right",
          startExit: "slide_out_left",
          endEnter: "slide_in_left",
          endExit: "slide_out_right",
        },
        headers: {
          "my-custom-header": "my custom header value",
        },
      })
      await sleep(800)
      Alert.alert(JSON.stringify(result))
    } else Linking.openURL(url)
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    } else {
      Alert.alert("bip")
    }
  }
}
