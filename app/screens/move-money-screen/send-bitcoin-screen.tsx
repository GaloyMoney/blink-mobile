import analytics from '@react-native-firebase/analytics'
import { useNavigation } from "@react-navigation/native"
import LottieView from 'lottie-react-native'
import * as React from "react"
import { useEffect, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPaymentDataInjected } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { validPayment } from "../../utils/parsing"
import { Token } from "../../utils/token"
import { IAddressType } from "../../utils/parsing"

const successLottie = require('./success_lottie.json')
const errorLottie = require('./error_lottie.json')
const pendingLottie = require('./pending_lottie.json')


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

  lottie: {height: 200}
})


export const SendBitcoinScreen: React.FC = ({ route }) => {
  const store = React.useContext(StoreContext)

  const [err, setErr] = useState("")
  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<IAddressType>(undefined)
  const [amountless, setAmountless] = useState(false)
  const [initAmount, setInitAmount] = useState(0)
  const [amount, setAmount] = useState(0)
  const [invoice, setInvoice] = useState("")
  const [note, setNote] = useState("")
  
  const [status, setStatus] = useState("idle")
  // idle, loading, pending, success, error 


  useEffect(() => {
    const {valid, invoice, amount, amountless, note, paymentType, address} = validPayment(route.params.payment, new Token().network)
    
    // this should be valid. Invoice / Address should be check before we show this screen
    // assert(valid)

    setStatus("idle")
    setAddress(address)
    setPaymentType(paymentType)
    setInvoice(invoice)
    setNote(note)
    setAmount(amount)
    setInitAmount(amount)
    setAmountless(amountless)
  }, [route.params.payment])

  const { goBack } = useNavigation()

  const payOnchain = async () => {
    console.tron.log("onchain payment trigger")
  }

  const pay = async () => {
    if(paymentType === "lightning") {
      return payInvoice()
    } else if (paymentType === "onchain"){
      return payOnchain()
    } else {
      console.tron.log(`${paymentType} is not handled properly`)
    }
  }

  const payInvoice = async () => {
    if (amountless && amount === 0) {
      setStatus("error")
      setErr(translate("SendBitcoinScreen.noAmount"))
      return
    }

    setErr("")
    setStatus("loading")

    try {
      const query = `mutation payInvoice($invoice: String!, $amount: Int) {
        invoice {
          payInvoice(invoice: $invoice, amount: $amount)
        }
      }`  

      const result = await store.mutate(
        query,
        {invoice, amount: amountless ? amount : undefined},
      )

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
        editable={paymentType === "lightning" ? 
          amountless && (status === "idle" || status === "error"):
          true // bitcoin // TODO: handle amount properly
        }
        initAmount={initAmount}
        onUpdateAmount={input => { setAmount(input); setStatus("idle")} }
        forceKeyboard={true}
      />
      <View style={styles.section}>
        <Text style={styles.smallText}>{translate("common.to")}</Text>
        <View style={styles.horizontalContainer}>
          <Input
            placeholder={translate("common.invoice")}
            leftIcon={
              <Icon name="ios-log-out" size={24} color={color.primary} style={styles.icon} />
            }
            value={paymentType === "lightning" ? invoice : address}
            containerStyle={styles.invoiceContainer}
            editable={false}
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
            <Text style={{fontSize: 18}}>{translate("SendBitcoinScreen.success")}</Text>
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
              {translate("SendBitcoinScreen.notConfirmed")}
            </Text>
          </>
        }
      </View>
      {
        <Button
          buttonStyle={styles.buttonStyle}
          title={(status === "success" || status === "pending") ? translate("common.close") : err ? translate("common.tryAgain") : amount == 0 ? translate("common.amountRequired") : translate("common.send")} // TODO refactor
          onPress={() => (status === "success" || status === "pending") ? goBack() : pay()}
          disabled={amount == 0}
          loading={status === "loading"}
        />
      }
    </Screen>
  )
}
