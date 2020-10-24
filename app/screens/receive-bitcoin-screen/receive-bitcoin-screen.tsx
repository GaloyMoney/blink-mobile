import Clipboard from "@react-native-community/clipboard"
import analytics from "@react-native-firebase/analytics"
import messaging from "@react-native-firebase/messaging"
import { values } from "mobx"
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  AppState,
  Keyboard,
  Platform,
  Pressable,
  Share,
  Text,
  View,
} from "react-native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import QRCode from "react-native-qrcode-svg"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { getHashFromInvoice } from "../../utils/bolt11"
import { requestPermission } from "../../utils/notifications"
import Toast from "react-native-root-toast"
import LottieView from 'lottie-react-native'
import Swiper from "react-native-swiper"

const successLottie = require('../move-money-screen/success_lottie.json')

const styles = EStyleSheet.create({
  buttonStyle: {
    backgroundColor: palette.lightBlue,
    borderRadius: 32,
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  qr: {
    // paddingTop: "12rem",
    alignItems: "center",
    // flex: 1,
  },

  section: {
    paddingHorizontal: 50,
    flex: 1,
    width: "100%"
  },

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "left",
  },

  headerView: {
    marginHorizontal: "24rem",
    marginTop: "12rem",
    borderRadius: 24,
    flex: 1
  },

  screen: {
    // FIXME: doesn't work for some reason
    // justifyContent: "space-around"
  },

  lottie: {
    width: "200rem",
    height: "200rem",
    // backgroundColor: 'red',
  },

  textStyle: {
    fontSize: "18rem",
    color: palette.darkGrey,
    textAlign: "center"
  },
})

export const ReceiveBitcoinScreen = observer(({ navigation }) => {
  console.tron.log("render ReceiveBitcoinScreen")

  const store = React.useContext(StoreContext)

  const [memo, setMemo] = useState("")
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState("")
  const [err, setErr] = useState("")
  const [isSucceed, setIsSucceed] = useState(false)

  useEffect(() => {
    update()
  }, [])

  useEffect(() => {
    const notifRequest = async () => {
      const waitUntilAuthorizationWindow = 5000

      if (Platform.OS === "ios") {
        const authorizationStatus = await messaging().hasPermission()

        let hasPermissions = false

        if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          hasPermissions = true
          console.tron.log("User has notification permissions enabled.")
        } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          console.tron.log("User has provisional notification permissions.")
        } else {
          console.tron.log("User has notification permissions disabled")
        }

        if (hasPermissions) {
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
                  onPress: () => console.tron.log("Cancel/Later Pressed"),
                  style: "cancel",
                },
                {
                  text: translate("common.ok"),
                  onPress: () => requestPermission(store),
                },
              ],
              { cancelable: true },
            ),
          waitUntilAuthorizationWindow,
        )
      }
    }

    notifRequest()
  }, [])

  const update = async () => {
    setLoading(true)
    console.tron.log("createInvoice")
    try {
      const query = `mutation addInvoice($value: Int, $memo: String) {
        invoice {
          addInvoice(value: $value, memo: $memo)
        }
      }`

      const result = await store.mutate(query, { value: amount, memo })
      const invoice = result.invoice.addInvoice
      setInvoice(invoice)
      console.tron.log("data has been set")
    } catch (err) {
      console.tron.log(`error with AddInvoice: ${err}`)
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

    // FIXME (with notifications?): this is very approximative:
    // 1 - it will only trigger if the payment is receiving while the screen is opened
    // 2 - amount in the variable could be different than the amount receive by the payment
    //     if the user has changed the amount and created a new invoice
    analytics().logEarnVirtualCurrency({ value: amount, virtual_currency_name: "btc" })

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
          const success = await store.updatePendingInvoice(hash)
          if (success) {
            paymentSuccess()
          }
        } catch (err) {
          console.tron.warn(`can't fetch invoice ${err}`)
        }
      }
    }

    AppState.addEventListener("change", _handleAppStateChange)

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    }
  }, [invoice])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        const hash = getHashFromInvoice(invoice)
        if (remoteMessage.data.type === "paid-invoice" && remoteMessage.data.hash === hash) {
          paymentSuccess()
        }
      }
    )

    return unsubscribe
  }, [invoice])

  const inputMemoRef = React.useRef()

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide)
    }
  })

  const _keyboardDidHide = () => {
    inputMemoRef?.current.blur()
  }

  const QRView = ({type}) => {

    let data

    if (type === "lightning") {
      data = invoice
    } else {
      data = values(store.lastOnChainAddresses)[0].id
    }

    const isReady = type === "lightning" ? !loading && data != "" : true

    const getFullUri = (input) => {
      if (type === "lightning") {
        // TODO add lightning:
        return input 
      } else {
        let uri = `bitcoin:${input}`
        const params = new URLSearchParams()
        if (!!amount) {
          params.append('amount', `${amount / 10 ** 8}`)
        }
        if (!!memo) {
          params.append('message', encodeURI(memo))
        }
        const fullUri = !!params.toString() ? `${uri}?${params.toString()}` : `${uri}`
        return fullUri
      }
    }

    const copyToClipboard = () => {
      Clipboard.setString(getFullUri(data))

      if (Platform.OS === "ios") {
        Toast.show(translate("ReceiveBitcoinScreen.copyClipboard"), {
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
        return data ? `${data.substr(0, 18)}...${data.substr(-18)}` : ''
      } else {
        return data
      }
    }

    return (
      <>
        <View style={styles.qr}>
          {isSucceed && 
            <LottieView source={successLottie} loop={false} autoPlay style={styles.lottie} resizeMode='cover' />
          || isReady && (
            <Pressable onPress={copyToClipboard}>
              <QRCode
                size={280}
                value={getFullUri(data)}
                logoBackgroundColor="white"
                ecl="M"
                logo={Icon.getImageSourceSync(
                  type === "lightning" ? "ios-flash" : "logo-bitcoin",
                  64,
                  palette.orange,
                )}
              />
            </Pressable>
          )
            ||
            <View
              style={{
                width: 280,
                height: 280,
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
                backgroundColor: palette.white,
                justifyContent: "center",
              }}
            >
            {err !== "" && 
              <Text style={{color: palette.red, alignSelf: "center"}} selectable={true}>{err}</Text>
            }
            {err === "" && 
              <ActivityIndicator size="large" color={palette.blue} />
            }
            </View>
          }
          <Pressable onPress={copyToClipboard}>
            <Text style={{textAlign: "center"}}>{dataOneLiner()}</Text>
          </Pressable>
          {isSucceed && 
            <Text>{translate("ReceiveBitcoinScreen.invoicePaid")}</Text>
          || isReady && 
            <Pressable onPress={copyToClipboard}>
              <Text>{translate("ReceiveBitcoinScreen.tapQrCodeCopy")}</Text>
            </Pressable>
            ||
            <Text> </Text>
          }
        </View>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={{ marginHorizontal: 52, paddingVertical: 18 }}
          title={isSucceed ? translate("common.ok") : translate(type === "lightning" ? "common.shareLightning" : "common.shareBitcoin")}
          onPress={isSucceed ? () => navigation.goBack(false) : share}
          disabled={!isReady}
          titleStyle={{ fontWeight: "bold" }}
        />
      </>
    )
  }
  

  return (
    <Screen backgroundColor={palette.lighterGrey} style={styles.screen} preset="scroll">
      <View style={styles.section}>
        <InputPaymentDataInjected
          onUpdateAmount={setAmount}
          onBlur={update}
          forceKeyboard={false}
          editable={!isSucceed}
          sub={false}
        />
        <Input placeholder="set a note" value={memo} onChangeText={setMemo} containerStyle={{marginTop: 0}}
          inputStyle={styles.textStyle}
          leftIcon={<Icon name={"ios-create-outline"} size={21} color={palette.darkGrey} />}
          ref={inputMemoRef}
          onBlur={update}
          disabled={isSucceed}
        />
      </View>
      {/* FIXME: fixed height */}
      <Swiper height={450} loop={false} >  
        <QRView type={"lightning"} />
        <QRView type={"bitcoind"} />
      </Swiper>
    </Screen>
  )
})
