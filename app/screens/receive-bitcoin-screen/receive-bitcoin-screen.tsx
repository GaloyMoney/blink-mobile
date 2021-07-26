import { gql, useApolloClient, useMutation } from "@apollo/client"
import Clipboard from "@react-native-community/clipboard"
import messaging from "@react-native-firebase/messaging"
import { StackNavigationProp } from "@react-navigation/stack"
import LottieView from "lottie-react-native"
import * as React from "react"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  AppState,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import QRCode from "react-native-qrcode-svg"
import Toast from "react-native-root-toast"
import ScreenBrightness from "react-native-screen-brightness"
import Swiper from "react-native-swiper"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { getHashFromInvoice } from "../../utils/bolt11"
import { isIos } from "../../utils/helper"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"

// FIXME: crash when no connection

// eslint-disable-next-line @typescript-eslint/no-var-requires
const successLottie = require("../move-money-screen/success_lottie.json")

const styles = EStyleSheet.create({
  buttonContainer: { marginHorizontal: 52, paddingVertical: 18 },

  buttonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
  },

  buttonTitle: {
    fontWeight: "bold",
  },

  copyToClipboardText: { textAlign: "center" },

  errorContainer: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: palette.white,
    height: 280,
    justifyContent: "center",
    width: 280,
  },

  lottie: {
    height: "200rem",
    width: "200rem",
    // backgroundColor: 'red',
  },

  qr: {
    // paddingTop: "12rem",
    alignItems: "center",
    // flex: 1,
  },

  screen: {
    // FIXME: doesn't work for some reason
    // justifyContent: "space-around"
  },

  section: {
    flex: 1,
    paddingHorizontal: 50,
    width: "100%",
  },

  textStyle: {
    color: palette.darkGrey,
    fontSize: "18rem",
    textAlign: "center",
  },
})

const ADD_INVOICE = gql`
  mutation addInvoice($value: Int, $memo: String) {
    invoice {
      addInvoice(value: $value, memo: $memo)
    }
  }
`

const UPDATE_PENDING_INVOICE = gql`
  mutation updatePendingInvoice($hash: String!) {
    invoice {
      updatePendingInvoice(hash: $hash)
    }
  }
`

const GET_ONCHAIN_ADDRESS = gql`
  query getLastOnChainAddress {
    getLastOnChainAddress {
      id
    }
  }
`

type Props = {
  navigation: StackNavigationProp<MoveMoneyStackParamList, "receiveBitcoin">
}

export const ReceiveBitcoinScreen: ScreenType = ({ navigation }: Props) => {
  const client = useApolloClient()

  const [addInvoice] = useMutation(ADD_INVOICE)
  const [updatePendingInvoice] = useMutation(UPDATE_PENDING_INVOICE)

  let lastOnChainAddress
  try {
    ;({
      getLastOnChainAddress: { id: lastOnChainAddress },
    } = client.readQuery({ query: GET_ONCHAIN_ADDRESS }))
  } catch (err) {
    // do better error handling
    lastOnChainAddress = "issue with the QRcode"
  }

  const [keyboardIsShown, setKeyboardIsShown] = useState(false)
  const [memo, setMemo] = useState("")
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState("")
  const [err, setErr] = useState("")
  const [isSucceed, setIsSucceed] = useState(false)
  const [brightnessInitial, setBrightnessInitial] = useState(null)

  useEffect(() => {
    update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fn = async () => {
      // android required permission, and open the settings page for it
      // it's probably not worth the hurdle
      //
      // only doing the brightness for iOS for now
      //
      // only need     <uses-permission android:name="android.permission.WRITE_SETTINGS" tools:ignore="ProtectedPermissions"/>
      // in the manifest
      // see: https://github.com/robinpowered/react-native-screen-brightness/issues/38
      //
      if (!isIos) {
        return
      }

      // let hasPerm = await ScreenBrightness.hasPermission();

      // if(!hasPerm){
      //   ScreenBrightness.requestPermission();
      // }

      // only enter this loop when brightnessInitial is not set
      // if (!brightnessInitial && hasPerm) {
      if (!brightnessInitial) {
        ScreenBrightness.getBrightness().then((brightness) => {
          console.log({ brightness })
          setBrightnessInitial(brightness)
          ScreenBrightness.setBrightness(1) // between 0 and 1
        })
      }
    }

    fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () =>
      brightnessInitial
        ? () => ScreenBrightness.setBrightness(brightnessInitial)
        : () => null,
    [brightnessInitial],
  )

  useEffect(() => {
    const notifRequest = async () => {
      const waitUntilAuthorizationWindow = 5000

      if (Platform.OS === "ios") {
        if (await hasFullPermissions()) {
          return
        }

        setTimeout(
          () =>
            Alert.alert(
              translate("common.notification"),
              translate("ReceiveBitcoinScreen.activateNotifications"),
              [
                {
                  text: translate("common.later"),
                  // todo: add analytics
                  onPress: () => console.log("Cancel/Later Pressed"),
                  style: "cancel",
                },
                {
                  text: translate("common.ok"),
                  onPress: () => requestPermission(client),
                },
              ],
              { cancelable: true },
            ),
          waitUntilAuthorizationWindow,
        )
      }
    }

    notifRequest()
  }, [client])

  const update = async () => {
    setLoading(true)
    console.log("createInvoice")
    try {
      const { data } = await addInvoice({ variables: { value: amount, memo } })
      const invoice = data.invoice.addInvoice
      setInvoice(invoice)
      console.log("invoice has been updated")
    } catch (err) {
      console.error(err, "error with AddInvoice")
      setErr(`${err}`)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const paymentSuccess = () => {
    // success

    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    ReactNativeHapticFeedback.trigger("notificationSuccess", options)

    setIsSucceed(true)

    // Alert.alert("success", translate("ReceiveBitcoinScreen.invoicePaid"), [
    //   {
    //     text: translate("common.ok"),
    //     onPress: () => {
    //       navigation.goBack(false)
    //     },
    //   },
    // ])
  }

  // temporary fix until we have a better management of notifications:
  // when coming back to active state. look if the invoice has been paid
  useEffect(() => {
    const _handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        try {
          const hash = getHashFromInvoice(invoice)

          const { data } = await updatePendingInvoice({ variables: { hash } })
          const success = await data.invoice.updatePendingInvoice
          if (success) {
            paymentSuccess()
          }
        } catch (err) {
          console.warn({ err }, "can't fetch invoice status")
        }
      }
    }

    AppState.addEventListener("change", _handleAppStateChange)

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    }
  }, [invoice, updatePendingInvoice])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const hash = getHashFromInvoice(invoice)
      if (
        remoteMessage.data.type === "paid-invoice" &&
        remoteMessage.data.hash === hash
      ) {
        paymentSuccess()
      }
    })

    return unsubscribe
  }, [invoice])

  const inputMemoRef = React.useRef()

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow)

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow)
    }
  })

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide)
    }
  })

  const _keyboardDidShow = () => {
    setKeyboardIsShown(true)
  }

  const _keyboardDidHide = () => {
    inputMemoRef?.current.blur()
    setKeyboardIsShown(false)
  }

  const QRView = ({ type }: { type: string }) => {
    let data

    if (type === "lightning") {
      data = invoice
    } else {
      data = lastOnChainAddress
    }

    const isReady =
      type === "lightning" ? !loading && data != "" && !keyboardIsShown : true

    const getFullUri = (input, uppercase = false) => {
      if (type === "lightning") {
        // TODO add lightning:
        return uppercase ? input.toUpperCase() : input
      }
      const uri = uppercase ? `bitcoin:${input}`.toUpperCase() : `bitcoin:${input}`
      const params = new URLSearchParams()
      if (amount) params.append("amount", `${amount / 10 ** 8}`)
      if (memo) {
        params.append("message", encodeURI(memo))
        return `${uri}?${params.toString()}`
      }
      const fullUri = params.toString() ? `${uri}?${params.toString()}` : `${uri}`
      return fullUri
    }

    const copyToClipboard = () => {
      Clipboard.setString(getFullUri(data))

      if (Platform.OS === "ios") {
        const sringToShow =
          type === "lightning"
            ? "ReceiveBitcoinScreen.copyClipboard"
            : "ReceiveBitcoinScreen.copyClipboardBitcoin"

        Toast.show(translate(sringToShow), {
          duration: Toast.durations.LONG,
          shadow: false,
          animation: true,
          hideOnPress: true,
          delay: 0,
          position: -100,
          opacity: 0.5,
        })
      }
    }

    const share = async () => {
      try {
        const result = await Share.share({
          message: getFullUri(data),
        })

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        Alert.alert(error.message)
      }
    }

    const dataOneLiner = () => {
      if (type === "lightning") {
        return data ? `${data.substr(0, 18)}...${data.substr(-18)}` : ""
      }
      return data
    }

    return (
      <>
        <View style={styles.qr}>
          {(isSucceed && (
            <LottieView
              source={successLottie}
              loop={false}
              autoPlay
              style={styles.lottie}
              resizeMode="cover"
            />
          )) ||
            (isReady && (
              <Pressable onPress={copyToClipboard}>
                <QRCode
                  size={280}
                  value={getFullUri(data, true)}
                  logoBackgroundColor="white"
                  ecl="L"
                  // __DEV__ workaround for https://github.com/facebook/react-native/issues/26705
                  logo={
                    !__DEV__ &&
                    Icon.getImageSourceSync(
                      type === "lightning" ? "ios-flash" : "logo-bitcoin",
                      28,
                      palette.orange,
                    )
                  }
                />
              </Pressable>
            )) || (
              <View style={styles.errorContainer}>
                {(err !== "" && (
                  // eslint-disable-next-line react-native/no-inline-styles
                  <Text style={{ color: palette.red, alignSelf: "center" }} selectable>
                    {err}
                  </Text>
                )) ||
                  (keyboardIsShown && (
                    <Icon size={56} name="ios-flash" color={palette.orange} />
                  )) || <ActivityIndicator size="large" color={palette.blue} />}
              </View>
            )}
          <Pressable onPress={copyToClipboard}>
            <Text style={styles.copyToClipboardText}>{dataOneLiner()}</Text>
          </Pressable>
          {(isSucceed && <Text>{translate("ReceiveBitcoinScreen.invoicePaid")}</Text>) ||
            (isReady && (
              <Pressable onPress={copyToClipboard}>
                <Text>{translate("ReceiveBitcoinScreen.tapQrCodeCopy")}</Text>
              </Pressable>
            )) || <Text> </Text>}
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
          title={
            isSucceed
              ? translate("common.ok")
              : translate(
                  type === "lightning" ? "common.shareLightning" : "common.shareBitcoin",
                )
          }
          onPress={isSucceed ? () => navigation.goBack() : share}
          disabled={!isReady}
          titleStyle={styles.buttonTitle}
        />
      </>
    )
  }

  return (
    <Screen backgroundColor={palette.lighterGrey} style={styles.screen} preset="fixed">
      <ScrollView>
        <View style={styles.section}>
          <InputPaymentDataInjected
            onUpdateAmount={setAmount}
            onBlur={update}
            forceKeyboard={false}
            editable={!isSucceed}
            sub
          />
          <Input
            placeholder={translate("ReceiveBitcoinScreen.setNote")}
            value={memo}
            onChangeText={setMemo}
            // eslint-disable-next-line react-native/no-inline-styles
            containerStyle={{ marginTop: 0 }}
            inputStyle={styles.textStyle}
            leftIcon={
              <Icon name="ios-create-outline" size={21} color={palette.darkGrey} />
            }
            ref={inputMemoRef}
            onBlur={update}
            disabled={isSucceed}
          />
        </View>
        {/* FIXME: fixed height */}
        <Swiper height={450} loop={false}>
          <QRView type="lightning" />
          <QRView type="bitcoind" />
        </Swiper>
      </ScrollView>
    </Screen>
  )
}
