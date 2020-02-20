import * as React from "react"
import { useState, useEffect } from "react"
import { inject, observer } from "mobx-react"
import {
  Text,
  View,
  ViewStyle,
  Alert,
  Clipboard,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { Screen } from "../../components/screen"
import { Input, Button } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme"
import { RNCamera } from "react-native-camera"
import { ScrollView } from "react-navigation"
import { useNavigation, useNavigationParam } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { Onboarding } from "types"
import { Switch } from "react-native-gesture-handler"
import { translate } from "../../i18n"

const CAMERA: ViewStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
}

const styles = StyleSheet.create({
  mainView: {
    paddingHorizontal: 20,
  },

  squareButton: {
    width: 70,
    height: 70,
    backgroundColor: color.primary,
  },

  smallText: {
    fontSize: 18,
    color: palette.darkGrey,
    textAlign: "left",
    marginBottom: 10,
  },

  note: {
    fontSize: 18,
    color: palette.darkGrey,
    textAlign: "left",
    marginLeft: 10,
  },

  horizontalContainer: {
    // flex: 1,
    flexDirection: "row",
  },

  icon: {
    marginRight: 15,
    color: palette.darkGrey,
  },

  invoiceContainer: {
    flex: 1,
    alignSelf: "flex-end",
  },

  buttonStyle: {
    backgroundColor: color.primary,
    marginVertical: 8,
  },

  section: {
    paddingTop: 12,
    paddingBottom: 8,
  },

  overlay: {
    position: "absolute",
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    justifyContent: "center",
  },
})

export const ScanningQRCodeScreen = inject("dataStore")(
  observer(({ dataStore }) => {
    const { navigate } = useNavigation()

    const callbackQRCode = async data => {
      decodeInvoice(data)
    }

    const pasteInvoice = async () => {
      decodeInvoice(await Clipboard.getString())
    }

    const decodeInvoice = async data => {
      try {
        let [protocol, request] = data.split(":")
        console.tron.log(protocol, request)
        if (protocol === "bitcoin") {
          Alert.alert("We're integrating Loop in. Use Lightning for now")
          return
        } else if (protocol.startsWith("ln") && request === undefined) {
          // it might start with 'lightning:'
          request = protocol
        } else if (protocol.toLowerCase() !== "lightning") {
          let message = `Only lightning procotol is accepted for now.`
          message += message === "" ? "" : `got following invoice: "${protocol}"`
          Alert.alert(message)
          return
        }

        const payReq = await dataStore.lnd.decodePayReq(request)
        console.tron.log(payReq)
        const invoice = request

        let amount, amountless, note

        if (payReq.numSatoshis) {
          amount = payReq.numSatoshis
          amountless = false
        } else {
          amount = 0
          amountless = true
        }

        if (payReq.description) {
          note = payReq.description
        } else {
          note = `invoice has no description`
        }

        navigate("sendBitcoin", { invoice, amount, amountless, note })
      } catch (err) {
        Alert.alert(err.toString())
      }
    }

    return (
      <Screen>
        <RNCamera
          style={CAMERA}
          captureAudio={false}
          onBarCodeRead={event => {
            const qr = event.data
            decodeInvoice(qr)
          }}
        />
        <View style={styles.overlay}>
          <Button
            buttonStyle={[styles.buttonStyle, { width: 180 }]}
            title="Paste"
            onPress={pasteInvoice}
          />
        </View>
      </Screen>
    )
  }),
)

ScanningQRCodeScreen.navigationOptions = () => ({
  title: translate("ScanningQRCodeScreen.title"),
})

export const SendBitcoinScreen: React.FC = inject("dataStore")(
  observer(({ dataStore }) => {
    const invoice = useNavigationParam("invoice")
    const amountless = useNavigationParam("amountless")
    const note = useNavigationParam("note")
    const amount = useNavigationParam("amount")

    const [manualAmount, setManualAmount] = useState(false)

    const { goBack } = useNavigation()

    const [useUSD, setUseUSD] = useState(false)
    const [message, setMessage] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)

    type payInvoiceResult = boolean | Error

    const onUseUSDChange = async input => {
      setUseUSD(input)

      if (input) {
        await dataStore.exchange.quoteLNDBTC({ side: "buy", satAmount: amount })
      } else {
        dataStore.exchange.quote.reset()
      }
    }

    const payInvoice = async () => {
      const payreq = { paymentRequest: invoice }

      if (invoice === "") {
        Alert.alert(`You need to paste an invoice or scan a QR Code`)
        return
      }

      if (amountless) {
        if (amount === 0) {
          Alert.alert(
            `This invoice doesn't have an amount, ` + `so you need to manually specify an amount`,
          )
          return
        }

        payreq["amt"] = amount
      }

      console.tron.log("payreq", payreq)

      setLoading(true)
      try {
        if (useUSD) {
          const success = await dataStore.exchange["buyLNDBTC"]()

          if (!success) {
            setErr(translate("errors.generic"))
            return
          }
        }

        const result: payInvoiceResult = await dataStore.lnd.payInvoice(payreq)

        console.tron.log(result)
        if (result === true) {
          setMessage("Payment succesfull")
          await dataStore.onboarding.add(Onboarding.firstLnPayment)
        } else {
          setErr(result.toString())
        }
      } catch (err) {
        setErr(err.toString())
      }
    }

    useEffect(() => {
      if (message !== "" || err !== "") {
        const header = err ? "error" : "success"

        const options = {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        }

        const haptic_feedback = err !== "" ? "notificationError" : "notificationSuccess"
        ReactNativeHapticFeedback.trigger(haptic_feedback, options)

        Alert.alert(header, message || err, [
          {
            text: translate("common.ok"),
            onPress: () => {
              goBack("moveMoney")
              setLoading(false)
            },
          },
        ])
        setMessage("")
        setErr("")
      }
    }, [message, err])

    return (
      <Screen>
        <ScrollView style={styles.mainView}>
          <View style={styles.section}>
            <Text style={styles.smallText}>{translate("common.to")}</Text>
            <View style={styles.horizontalContainer}>
              <Input
                placeholder="Invoice"
                leftIcon={
                  <Icon name="ios-log-out" size={24} color={color.primary} style={styles.icon} />
                }
                value={invoice}
                containerStyle={styles.invoiceContainer}
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.smallText}>{translate("SendBitcoinScreen.amount")}</Text>
            <Input
              leftIcon={<Text style={styles.icon}>{translate("common.sats")}</Text>}
              onChangeText={input => setManualAmount(+input)}
              value={amountless ? manualAmount.toString() : amount.toString()}
              disabled={!amountless}
              returnKeyType="done"
              keyboardType="number-pad" // TODO, there should be no keyboard here
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.smallText}>{translate("SendBitcoinScreen.note")}</Text>
            <Text style={styles.note}>{note}</Text>
          </View>
          <View style={[styles.horizontalContainer, { marginTop: 8 }]}>
            <Text style={[styles.smallText, { paddingTop: 5 }]}>
              {translate("SendBitcoinScreen.payFromUSD")}
            </Text>
            <View style={{ flex: 1 }} />
            <Switch value={useUSD} onValueChange={input => onUseUSDChange(input)} />
          </View>
          {useUSD && (
            <View style={[styles.horizontalContainer, { marginTop: 8 }]}>
              <Text style={[styles.smallText]}>{translate("SendBitcoinScreen.cost")}</Text>
              <View style={{ flex: 1 }} />
              {(isNaN(dataStore.exchange.quote.satPrice) && <ActivityIndicator />) || (
                <Text style={[styles.smallText]}>
                  $
                  {(dataStore.exchange.quote.satPrice * dataStore.exchange.quote.satAmount).toFixed(
                    3,
                  )}
                </Text>
              )}
            </View>
          )}
          <Button
            buttonStyle={styles.buttonStyle}
            title="Send"
            onPress={payInvoice}
            disabled={invoice === ""}
            loading={loading}
          />
        </ScrollView>
      </Screen>
    )
  }),
)

SendBitcoinScreen.navigationOptions = () => ({
  title: translate("SendBitcoinScreen.title"),
})
