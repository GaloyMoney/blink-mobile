import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native"
import Clipboard from "@react-native-community/clipboard"
import { RNCamera } from "react-native-camera"
import { Button, Input } from "react-native-elements"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { getDescription } from "../../utils/lightning"
import { request } from "../../utils/request"
import { validInvoice } from "../../utils/parsing"

const CAMERA: ViewStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
}

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: color.primary,
    marginVertical: 8,
  },

  horizontalContainer: {
    // flex: 1,
    flexDirection: "row",
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  invoiceContainer: {
    alignSelf: "flex-end",
    flex: 1,
  },

  mainView: {
    paddingHorizontal: 20,
  },

  note: {
    color: palette.darkGrey,
    fontSize: 18,
    marginLeft: 10,
    textAlign: "left",
  },

  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },

  section: {
    paddingBottom: 8,
    paddingTop: 12,
  },

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    marginBottom: 10,
    textAlign: "left",
  },

  squareButton: {
    backgroundColor: color.primary,
    height: 70,
    width: 70,
  },
})

export const ScanningQRCodeScreen = () => {
  const store = React.useContext(StoreContext)

  const { navigate } = useNavigation()

  const pasteInvoice = async () => {
    decodeInvoice(await Clipboard.getString())
  }

  const decodeInvoice = async (data) => {

    try {
      const [valid, errorMessage, invoice, amount, amountless, note] = validInvoice(data)
      if (!valid) {
        Alert.alert(errorMessage)
        return
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
        onBarCodeRead={(event) => {
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
}

export const SendBitcoinScreen: React.FC = ({ route }) => {
  const store = React.useContext(StoreContext)

  const invoice = route.params.invoice
  const amountless = route.params.amountless
  const note = route.params.note
  const amount = route.params.amount

  // TODO add back manualAmount capability
  const [manualAmount, setManualAmount] = useState(0)

  const { goBack } = useNavigation()

  const [message, setMessage] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const payInvoice = async () => {
    if (amountless && amount === 0) {
      Alert.alert(
        `This invoice doesn't have an amount, so you need to manually specify how much money you want to send`,
      )
      return
    }

    // FIXME what is it for?
    // payreq.amt = amount

    setLoading(true)

    // FIXME: add the manual amount flow. 
    try {
      const query = `mutation payInvoice($invoice: String) {
        invoice {
          payInvoice(invoice: $invoice)
        }
      }`

      const result = await request(query, {invoice})

      if (result.invoice.payInvoice === "success") {
        store.queryWallet()
        setMessage("Payment succesfull")
      } else if (result.invoice.payInvoice === "pending") {
        setMessage("Payment has been sent but is not confirmed yet")
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
      <InputPaymentDataInjected
          editable={amountless}
          initAmount={amount}
          onUpdateAmount={input => setManualAmount(input)}
        />
      <View style={styles.section}>
        </View>
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
          <Text style={styles.smallText}>{translate("SendBitcoinScreen.note")}</Text>
          <Text style={styles.note}>{note}</Text>
        </View>
        {/* <View style={[styles.horizontalContainer, { marginTop: 8 }]}>
          <Text style={[styles.smallText, { paddingTop: 5 }]}>
            {translate("SendBitcoinScreen.payFromUSD")}
          </Text>
          <View style={{ flex: 1 }} />
          <Switch value={useUSD} onValueChange={(input) => onUseUSDChange(input)} />
        </View>
        {useUSD && (
          <View style={[styles.horizontalContainer, { marginTop: 8 }]}>
            <Text style={styles.smallText}>{translate("SendBitcoinScreen.cost")}</Text>
            <View style={{ flex: 1 }} />
            {(isNaN(dataStore.exchange.quote.satPrice) && <ActivityIndicator />) || (
              <Text style={styles.smallText}>
                $
                {(dataStore.exchange.quote.satPrice * dataStore.exchange.quote.satAmount).toFixed(
                  3,
                )}
              </Text>
            )}
          </View>
        )} */}
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
}
