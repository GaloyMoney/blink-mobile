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
  Platform,
  Pressable,
  Share,
  Text,
  View,
} from "react-native"
import { Button, ButtonGroup, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import QRCode from "react-native-qrcode-svg"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { getHashFromInvoice } from "../../utils/lightning"
import { requestPermission } from "../../utils/notifications"
import Toast from "react-native-root-toast"

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
    flex: 1,
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
    justifyContent: "space-around"
  }
})

export const ReceiveBitcoinScreen = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)

  // FIXME TODO add back a way to set a memo
  const [memo, setMemo] = useState("")

  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [networkIndex, setNetworkIndex] = useState(0)
  const [data, setData] = useState("")

  useEffect(() => {
    update()
  }, [networkIndex])

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
    if (networkIndex === 0) {
      await createInvoice()
    } else {
      const uri = `bitcoin:${values(store.lastOnChainAddresses)[0].id}`
      setData(amount === 0 ? uri : uri + `?amount=${amount / 10 ** 8}`)
      setLoading(false)
    }
  }

  const copyInvoice = () => {
    Clipboard.setString(data)

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

  const shareInvoice = async () => {
    try {
      const result = await Share.share({
        message: data,
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

  const success = () => {
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
    Alert.alert("success", translate("ReceiveBitcoinScreen.invoicePaid"), [
      {
        text: translate("common.ok"),
        onPress: () => {
          navigation.goBack(false)
        },
      },
    ])
  }

  // temporary fix until we have a better management of notifications:
  // when coming back to active state. look if the invoice has been paid
  useEffect(() => {
    const _handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        if (networkIndex === 0) {
          // lightning
          const query = `mutation updatePendingInvoice($hash: String!) {
            invoice {
              updatePendingInvoice(hash: $hash)
            }
          }`

          try {
            console.tron.log({ data })
            const hash = getHashFromInvoice(data)
            console.tron.log({ hash })
            const result = await store.mutate(query, { hash })
            if (result.invoice.updatePendingInvoice === true) {
              success()
            }
          } catch (err) {
            console.tron.warn(`can't fetch invoice ${err}`)
          }
        } else {
          // TODO
        }
      }
    }

    AppState.addEventListener("change", _handleAppStateChange)

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    }
  }, [data])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (networkIndex === 0) {
        const hash = getHashFromInvoice(data)
        if (remoteMessage.data.type === "paid-invoice" && remoteMessage.data.hash === hash) {
          success()
        }
      } else {
        console.tron.log("// TODO bitcoin as well")
      }
    })

    return unsubscribe
  }, [data]) // FIXME: not sure why data need to be in scope here, but otherwise the async function will have data = null

  const createInvoice = async () => {
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
      setData(invoice)
      console.tron.log("data has been set")
    } catch (err) {
      console.tron.log(`error with AddInvoice: ${err}`)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const isReady = !loading && data != ""

  const getIcon = (icon, name, index) => <View style={{flexDirection: 'row'}}>
    <Icon name={icon} size={18} color={palette.orange} style={{top: 2}} />
    <Text style={{ marginLeft: 6, fontWeight: "bold", fontSize: 18, 
      color: networkIndex === index ? palette.white : palette.darkGrey }}>
      {name}
    </Text>
  </View>

  const LightningComponent = () => getIcon("ios-flash", "Lightning", 0)
  const BitcoinComponent = () => getIcon("logo-bitcoin", "On-Chain", 1)

  return (
    <Screen backgroundColor={palette.lighterGrey} style={styles.screen} preset="scroll">
      <ButtonGroup
        onPress={setNetworkIndex}
        selectedIndex={networkIndex}
        buttons={[{element: LightningComponent}, {element: BitcoinComponent}]}
        containerStyle={styles.headerView}
        selectedButtonStyle={{ backgroundColor: palette.lightBlue }}
      />
      <View style={styles.section}>
        <InputPaymentDataInjected
          onUpdateAmount={setAmount}
          onBlur={update}
          forceKeyboard={false}
        />
        <Input placeholder="Optional note" value={memo} onChangeText={setMemo}
          leftIcon={<Icon name={"ios-create-outline"} size={21} color={palette.darkGrey} />}
        />
      </View>
      <View style={styles.qr}>
        {isReady && (
          <Pressable onPress={copyInvoice}>
            <QRCode
              size={280}
              value={data}
              logoBackgroundColor="white"
              ecl="M"
              logo={Icon.getImageSourceSync(
                networkIndex === 0 ? "ios-flash" : "logo-bitcoin",
                64,
                palette.orange,
              )}
            />
          </Pressable>
        ) ||
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
            <ActivityIndicator size="large" color={palette.blue} />
          </View>
        }
        {isReady && 
          <Text>{translate("ReceiveBitcoinScreen.tapQrCodeCopy")}</Text>
          ||
          <Text> </Text>
        }
      </View>
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={{ marginHorizontal: 48, paddingVertical: 18, flex: 1 }}
        title={translate("common.share")}
        onPress={shareInvoice}
        disabled={!isReady}
        titleStyle={{ fontWeight: "bold" }}
      />
    </Screen>
  )
})
