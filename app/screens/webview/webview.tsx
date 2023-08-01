import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { useTheme } from "@rneui/themed"
import { Alert } from "react-native"
import { injectJs, onMessageHandler } from "react-native-webln"
import { WebView } from "react-native-webview"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"

const uri = "http://localhost:3001"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Primary">
}

export const WebViewScreen: React.FC<Props> = ({ navigation }) => {
  const {
    theme: { colors },
  } = useTheme()
  const webview = React.useRef<WebView>()
  const [jsInjected, setJsInjected] = React.useState(false)

  return (
    <Screen>
      <WebView
        ref={webview}
        source={{ uri }}
        onLoadStart={() => setJsInjected(false)}
        onLoadProgress={(e) => {
          if (!jsInjected && e.nativeEvent.progress > 0.75) {
            if (webview.current) {
              webview.current.injectJavaScript(injectJs())
              setJsInjected(true)
            } else Alert.alert("Error", "Webview not ready")
          }
        }}
        onMessage={onMessageHandler(webview, {
          enable: async () => {
            /* Your implementation goes here */
          },
          getInfo: async () => {
            /* Your implementation goes here */
          },
          makeInvoice: async (args) => {
            /* Your implementation goes here */
          },
          sendPayment: async (paymentRequestStr) => {
            navigation.navigate("sendBitcoinDestination", {
              payment: paymentRequestStr,
              autoValidate: true,
            })
            /* Your implementation goes here */
          },
          signMessage: async (message) => {
            /* Your implementation goes here */
          },
          verifyMessage: async (signature, message) => {
            /* Your implementation goes here */
          },

          // Non-WebLN
          // Called when an a-tag containing a `lightning:` uri is found on a page
          foundInvoice: async (paymentRequestStr) => {
            /* Your implementation goes here */
          },
        })}
        style={{ width: "100%", height: "100%", flex: 1 }}
      />
    </Screen>
  )
}
