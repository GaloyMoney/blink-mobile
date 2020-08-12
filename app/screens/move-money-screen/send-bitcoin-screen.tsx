import { useIsFocused, useNavigation } from "@react-navigation/native"
import * as React from "react"
import { useEffect, useState } from "react"
import { Alert, Dimensions, Platform, Pressable, ScrollView, Text, View, ViewStyle } from "react-native"
import { RNCamera } from "react-native-camera"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import ImagePicker from 'react-native-image-picker'
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { validInvoice } from "../../utils/parsing"
import { request } from "../../utils/request"
const LocalQRCode = require('@remobile/react-native-qrcode-local-image');
import analytics from '@react-native-firebase/analytics'

import LottieView from 'lottie-react-native'
const successLottie = require('./success_lottie.json')
const errorLottie = require('./error_lottie.json')
const pendingLottie = require('./pending_lottie.json')

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
    marginBottom: 32,
    marginTop: 16,
    marginHorizontal: 24,
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
    flex: 1
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
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },

	rectangle: {
    height: screenWidth * .65,
    width: screenWidth * .65,
		borderWidth: 2,
		borderColor: palette.blue,
		backgroundColor: 'transparent',
  },
  
  lottie: {height: 200}
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
    ImagePicker.launchImageLibrary({
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

  const { invoice, amountless, note } = route.params
  const [ amount, setAmount] = useState(route.params.amount)

  const { goBack } = useNavigation()

  const [err, setErr] = useState("")
  const [status, setStatus] = useState("idle") 
  // idle, loading, pending, success, error 

  const payInvoice = async () => {
    if (amountless && amount === 0) {
      setStatus("error")
      setErr(`This invoice doesn't have an amount, so you need to manually specify how much money you want to send`)
      return
    }

    setErr("")

    const query = `mutation payInvoice($invoice: String, $amount: Int) {
      invoice {
        payInvoice(invoice: $invoice, amount: $amount)
      }
    }`

    setStatus("loading")

    try {
      const result = await request(query, {invoice, amount: amountless ? amount : undefined })

      if (result.invoice.payInvoice === "success") {
        store.queryWallet()
        setStatus("success")
        analytics().logSpendVirtualCurrency({value: amount, virtual_currency_name: "btc", item_name: "lightning"})
      } else if (result.invoice.payInvoice === "pending") {
        setStatus("pending")
      } else {
        setStatus("error")
        setErr(result.toString())
      }
    } catch (err) {
      setStatus("error")
      setErr(err.toString())
    }
  }
  
  useEffect(() => {
    if (status === "loading" || status === "idle") {
      return
    }

    let notificationType

    if (status === "pending" || status === "error") {
      notificationType = "notificationError"
    }

    if (status === "success") {
      notificationType = "notificationSuccess"
    }

    const optionsHaptic = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    }

    ReactNativeHapticFeedback.trigger(notificationType, optionsHaptic)
  }, [status])

  return (
    <Screen style={styles.mainView} preset={"scroll"}>
      <InputPaymentDataInjected
        editable={amountless && (status === "idle" || status === "error")}
        initAmount={amount}
        onUpdateAmount={input => { setAmount(input); setStatus("idle")} }
        />
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
      {!!note && 
        <View style={styles.section}>
          <Text style={styles.smallText}>{translate("SendBitcoinScreen.note")}</Text>
          <Text style={styles.note}>{note}</Text>
        </View>
      }
      <View style={{flex: 1, alignItems: "center"}}>
        { status === "success" &&
          <>
            <LottieView source={successLottie} loop={false} autoPlay style={styles.lottie} />
            <Text style={{fontSize: 18}}>Payment has been sent succesfully</Text>
          </>
        }
        {
          status === "error" && 
          <>
            <LottieView source={errorLottie} loop={false} autoPlay style={styles.lottie} />
            <ScrollView>
              <Text>{err}</Text>
            </ScrollView>
          </>
        }
        {
          status === "pending" && 
          <>
            <LottieView source={pendingLottie} loop={false} autoPlay style={styles.lottie} />
            <Text style={{fontSize: 18, textAlign: "center"}}>
              {"Payment has been sent\nbut is not confirmed yet"}
              {"\n\nYou can check the status\nof the payment in Transactions"}
            </Text>
          </>
        }
      </View>
      {
        <Button
          buttonStyle={styles.buttonStyle}
          title={status === "success" ? "Close" : err ? "Try again" : amount === 0 ? "Amount is required" : "Send"} // TODO refactor
          onPress={() => (status === "success" || status === "pending") ? goBack() : payInvoice()}
          disabled={amount === 0}
          loading={status === "loading"}
        />
      }
    </Screen>
  )
}
