import React from "react"
import WebView from "react-native-webview"
import { StoryScreen } from "../../../.storybook/views"
import { light } from "../../rne-theme/colors"
import { View } from "react-native"
import { InAppBrowser } from "react-native-inappbrowser-reborn"
import { Button } from "@rneui/themed"
import { Alert } from "react-native"
import { Linking } from "react-native"

export default {
  title: "Webview",
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
}

export const Default = () => (
  <View
    style={{
      backgroundColor: light.primary,
      flex: 1,
      borderWidth: 2,
      borderColor: light._blue,
    }}
  >
    <WebView
      originWhitelist={["*"]}
      source={{ uri: "https://www.blink.sv/blog" }}
      style={{ marginTop: 20, flex: 0, height: 500 }}
      useWebView2={true}
    />
  </View>
)

export const InAppBrowserStory = () => {
  const arg = {
    // iOS Properties
    dismissButtonStyle: "close",
    preferredBarTintColor: "#453AA4",
    preferredControlTintColor: "white",
    readerMode: false,
    animated: true,
    modalPresentationStyle: "pageSheet",
    modalTransitionStyle: "coverVertical",
    modalEnabled: true,
    enableBarCollapsing: true,
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
  }
  const url = "https://github.com/proyecto26"

  const open = async () => {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, arg)
        Alert.alert(JSON.stringify(result))
      } else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const openAuth = async () => {
    try {
      const callback = ""
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(url, callback, arg)
        Alert.alert(JSON.stringify(result))
      } else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  return (
    <>
      <Button title={"open"} onPress={open} />
      <Button title={"openAuth"} onPress={openAuth} />
    </>
  )
}
