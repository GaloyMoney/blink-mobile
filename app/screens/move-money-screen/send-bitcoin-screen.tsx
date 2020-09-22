import analytics from '@react-native-firebase/analytics'
import { useNavigation } from "@react-navigation/native"
import LottieView from 'lottie-react-native'
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TextInput } from "react-native-gesture-handler"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPayment } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { CurrencyType } from "../../utils/enum"
import { IPaymentType, validPayment } from "../../utils/parsing"
import { Token } from "../../utils/token"

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
    flex: 1,
    flexDirection: "row",
  },

  icon: {
    color: palette.darkGrey,
    marginRight: 15,
  },

  mainView: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "space-between",
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

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "left",
    width: "48rem",
  },

  squareButton: {
    backgroundColor: color.primary,
    height: 70,
    width: 70,
  },

  lottie: {
    width: "200rem",
    height: "200rem",
    // backgroundColor: 'red',
  },

  section: {
    marginHorizontal: 48,
    // width: "100%"
  },
})


export const SendBitcoinScreen: React.FC = observer(({ route }) => {
  const store = React.useContext(StoreContext)

  const [err, setErr] = useState("")
  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const [amountless, setAmountless] = useState(false)
  const [initAmount, setInitAmount] = useState(0)
  const [amount, setAmount] = useState(0)
  const [invoice, setInvoice] = useState("")
  const [note, setNote] = useState("")
  const [fee, setFee] = useState(null)
  
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

    getFee()
  }, [route.params.payment])

  useEffect(() => {
    getFee()
  }, [address])
  
  const getFee = async () => {
    try {
      const query = `mutation onchain($address: String!){
        onchain {
          getFee(address: $address)
        }
      }`
      const { onchain: { getFee: fee }} = await store.mutate(query, { address })
      setFee(fee)
    } catch (err) {
      setFee(null)
    }
  }

  const { goBack } = useNavigation()

  const pay = async () => {
    if ((amountless || paymentType === "onchain") && amount === 0) {
      setStatus("error")
      setErr(translate("SendBitcoinScreen.noAmount"))
      return
    }

    setErr("")
    setStatus("loading")

    let success, result

    try {

      if(paymentType === "lightning") {
  
        const query = `mutation payInvoice($invoice: String!, $amount: Int) {
          invoice {
            payInvoice(invoice: $invoice, amount: $amount)
          }
        }`  
  
        result = await store.mutate(
          query,
          {invoice, amount: amountless ? amount : undefined},
        )

        // FIXME merge type with onchain?
        success = result.invoice.payInvoice === "success"
  
      } else if (paymentType === "onchain"){
        const query = `mutation onchain($address: String!, $amount: Int!) {
          onchain {
            pay(address: $address, amount: $amount) {
              success
            }
          }
        }`

        result = await store.mutate(
          query,
          {address, amount},
        )

        success = result.onchain.pay.success

      }

      if (success) {
        store.queryWallet()
        setStatus("success")
        analytics().logSpendVirtualCurrency({value: amount, virtual_currency_name: "btc", item_name: "lightning"})
      } else if (result?.invoice?.payInvoice === "pending") {
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

  const price = store.rate(CurrencyType.BTC)
  const feeText = fee == null ? fee : textCurrencyFormatting(fee, price, store.prefCurrency)

  return <SendBitcoinScreenJSX status={status} paymentType={paymentType} amountless={amountless}
  initAmount={initAmount} setAmount={setAmount} setStatus={setStatus} invoice={invoice} 
  address={address} note={note} err={err} amount={amount} goBack={goBack} pay={pay}
  price={price} 
  prefCurrency={store.prefCurrency} 
  fee={feeText}
  nextPrefCurrency={store.nextPrefCurrency}
   />
})


export const SendBitcoinScreenJSX = ({
  status, paymentType, amountless, initAmount, setAmount, setStatus, invoice, fee,
  address, note, err, amount, goBack, pay, price, prefCurrency, nextPrefCurrency }) => (
  <Screen style={styles.mainView} preset={"scroll"}>
    <View style={styles.section}>
      <InputPayment
        editable={paymentType === "lightning" ? 
          amountless && (status === "idle" || status === "error"):
          true // bitcoin // TODO: handle amount properly
        }
        initAmount={initAmount}
        onUpdateAmount={input => { setAmount(input); setStatus("idle")} }
        forceKeyboard={true}
        price={price}
        prefCurrency={prefCurrency}
        nextPrefCurrency={nextPrefCurrency}
      />
    </View>
    <View style={{marginTop: 18}}>
      <Input
        placeholder={translate("common.invoice")}
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.to")}</Text>
            <Icon name="ios-log-out" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        value={paymentType === "lightning" ? invoice : address}
        renderErrorMessage={false}
        editable={false}
        selectTextOnFocus={true}
        // InputComponent={(props) => <Text {...props} selectable={true}>{props.value}</Text>}
      />
      {!!note && 
      <Input
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.note")}</Text>
            <Icon name="ios-create-outline" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        value={note}
        renderErrorMessage={false}
        editable={false}
        selectTextOnFocus={true}
        // InputComponent={(props) => <Text {...props} selectable={true}>{props.value}</Text>}
      />
      }
      {!!address && 
      <Input
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.fee")}</Text>
            <Icon name="ios-pricetag" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        value={fee}
        editable={false}
        selectTextOnFocus={true}
        InputComponent={props => fee == null ?
          <ActivityIndicator animating={true} size="small" color={palette.orange} /> :
          <TextInput {...props} />
        }
      />
      }
    </View>
    <View style={{alignItems: "center"}}>
      { status === "success" &&
        <>
          <LottieView source={successLottie} loop={false} autoPlay style={styles.lottie} resizeMode='cover' />
          <Text style={{fontSize: 18}}>{translate("SendBitcoinScreen.success")}</Text>
        </>
      }
      {
        status === "error" && 
        <>
          <LottieView source={errorLottie} loop={false} autoPlay style={styles.lottie} resizeMode='cover' />
          <ScrollView>
            <Text>{err}</Text>
          </ScrollView>
        </>
      }
      {
        status === "pending" && 
        <>
          <LottieView source={pendingLottie} loop={false} autoPlay style={styles.lottie} resizeMode='cover' />
          <Text style={{fontSize: 18, textAlign: "center"}}>
            {translate("SendBitcoinScreen.notConfirmed")}
          </Text>
        </>
      }
    </View>
    <Button
      buttonStyle={styles.buttonStyle}
      containerStyle={{flex: 1}}
      title={(status === "success" || status === "pending") ? translate("common.close") : err ? translate("common.tryAgain") : amount == 0 ? translate("common.amountRequired") : translate("common.send")} // TODO refactor
      onPress={() => (status === "success" || status === "pending") ? goBack() : pay()}
      disabled={amount == 0}
      loading={status === "loading"}
    />
  </Screen>
)
