import { useNavigation, useIsFocused } from "@react-navigation/native"
import * as React from "react"
import { useEffect, useState } from "react"
import { Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ViewStyle } from "react-native"
import { Button, Input } from "react-native-elements"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { request } from "../../utils/request"
import { validInvoice } from "../../utils/parsing"
import EStyleSheet from "react-native-extended-stylesheet"
import Svg, { Circle } from "react-native-svg"
import ImagePicker from 'react-native-image-picker';
import { RNCamera } from "react-native-camera"
const LocalQRCode = require('@remobile/react-native-qrcode-local-image');

const CAMERA: ViewStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
}

const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const styles = EStyleSheet.create({
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

  rectangleContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'
  },

	rectangle: {
    height: screenWidth * .65,
    width: screenWidth * .65,
		borderWidth: 2,
		borderColor: palette.blue,
		backgroundColor: 'transparent',
	},
})

export const ScanningQRCodeScreen = () => {
  const { navigate, goBack } = useNavigation()

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

  const showImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {
        title: null,
        mediaType: 'photo',
        takePhotoButtonTitle: null,
      },
      response => {
        if (response.uri) {
          const uri = Platform.OS === 'ios' ? response.uri.toString().replace('file://', '') : response.path.toString();
          LocalQRCode.decode(uri, (error, result) => {
            if (!error) {
              decodeInvoice( result );
            } else {
              if (error.message === "Feature size is zero!") {
                Alert.alert("we could not find a QR code in the image");
              } else {
                console.tron.log({error})
                Alert.alert(error.message);
              }
            }
          });
        }
      },
  )}

  return (
    <Screen unsafe={true}>
      {useIsFocused() &&
      <RNCamera
        style={CAMERA}
        captureAudio={false}
        onBarCodeRead={(event) => {
          const qr = event.data
          decodeInvoice(qr)
        }}
        onTap={(r) => console.tron.log({r})}
        >
        <View style={styles.rectangleContainer}>
          <View style={[styles.rectangle]} />
        </View>
        <Pressable onPress={goBack}>
          <View style={{width: 64, height: 64, alignSelf: "flex-end", marginTop: 40, marginRight: 16}}>
            <Svg viewBox="0 0 100 100">
              <Circle cx={50} cy={50} r={50} fill={palette.white} opacity={.5} />
            </Svg>
            <Icon name="ios-close" size={64} style={{position: "absolute", top: -2}} />
          </View>
        </Pressable>
        <View style={{position: "absolute", width: screenWidth, height: 128, top: screenHeight - 96, left: 32}}>
          <Pressable onPress={showImagePicker}>
            <Icon name="image" size={64} color={palette.lightGrey} style={{opacity: .8}} />
          </Pressable>
        </View>
      </RNCamera>}
    </Screen>
  )
}

export const SendBitcoinScreen: React.FC = ({ route }) => {
  const store = React.useContext(StoreContext)

  const { invoice, amountless, note, amount } = route.params
  const [manualAmount, setManualAmount] = useState(0)

  const { goBack } = useNavigation()

  const [message, setMessage] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const payInvoice = async () => {
    if (amountless && manualAmount === 0) {
      Alert.alert(
        `This invoice doesn't have an amount, so you need to manually specify how much money you want to send`,
      )
      return
    }

    // FIXME what is it for?
    // payreq.amt = amount

    setLoading(true)

    const query = `mutation payInvoice($invoice: String, $amount: Int) {
      invoice {
        payInvoice(invoice: $invoice, amount: $amount)
      }
    }`

    try {
      const result = await request(query, {invoice, amount: amountless ? manualAmount : undefined})

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
