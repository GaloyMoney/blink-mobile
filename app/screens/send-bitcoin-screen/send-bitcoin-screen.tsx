import analytics from '@react-native-firebase/analytics'
import { useNavigation } from "@react-navigation/native"
import LottieView from 'lottie-react-native'
import { observer } from "mobx-react"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { Button, Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TextInput } from "react-native-gesture-handler"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Icon from "react-native-vector-icons/Ionicons"
import { InputPayment } from "../../components/input-payment"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext, useQuery } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { textCurrencyFormatting } from "../../utils/currencyConversion"
import { CurrencyType } from "../../utils/enum"
import { IPaymentType, validPayment } from "../../utils/parsing"
import { Token } from "../../utils/token"

const successLottie = require('../move-money-screen/success_lottie.json')
const errorLottie = require('../move-money-screen/error_lottie.json')
const pendingLottie = require('../move-money-screen/pending_lottie.json')


const styles = EStyleSheet.create({
  buttonStyle: {
    backgroundColor: color.primary,
    marginBottom: 32,
    marginTop: 32,
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

  memo: {
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

  errorText: {
    fontSize: 18,
    color: palette.red,
  }
})

const regexFilter = (network) => {
  switch (network) {
    case "mainnet": return /^(1|3|bc1|lnbc1)/i
    case "testnet": return /^(2|bcrt|lnbcrt)/i
    case "regtest": return /^(2|bcrt|lnbcrt)/i
    default: console.tron.warn("error network")
  }
}


export const SendBitcoinScreen: React.FC = observer(({ route }) => {
  const store = React.useContext(StoreContext)

  const [errs, setErrs] = useState([])
  const [invoiceError, setInvoiceError] = useState("")

  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const [amountless, setAmountless] = useState(false)
  const [initAmount, setInitAmount] = useState(0)
  const [amount, setAmount] = useState(0)
  const [destination, setDestination] = useState("")
  const [invoice, setInvoice] = useState("")
  const [memo, setMemo] = useState("")
  const [initialMemo, setInitialMemo] = useState("")


  // if null ==> we don't know (blank fee field)
  // if undefined ==> loading
  // if -1, there is an error
  // otherwise, fee in sats
  const [fee, setFee] = useState(null)
  
  const [interactive, setInteractive] = useState(false)
  
  const [status, setStatus] = useState("idle")
  // idle, loading, pending, success, error 

  const { error: errorQuery, loading: loadingUserNameExist, data, setQuery } = useQuery()
  const usernameExists = data?.usernameExists ?? false
  
  const balance = store.balance("BTC")

  const network = new Token().network
  const potentialBitcoinOrLightning = regexFilter(network).test(destination)

  const { goBack } = useNavigation()

  useEffect(() => {
    reset()
    const {valid, username} = validPayment(route.params?.payment, network, store.myPubKey, store.username)
    if (route.params?.username || username) {
      setInteractive(false)
      setDestination(route.params?.username || username)
    } else if (valid) {
      setInteractive(false)
      setDestination(route.params?.payment)
      setAmount(amount)
      setMemo(memo)
    } else {
      setInteractive(true)
    }
  }, [route.params])

  const reset = () => {
    setStatus("idle")
    setErrs([])
    setInvoiceError("")
    setAddress("")
    setPaymentType(undefined)
    setAmountless(false)
    setInitAmount(0)
    setAmount(0)
    setDestination("")
    setInvoice("")
    setMemo("")
    setInitialMemo("")
  }

  useEffect(() => {
    const fn = async () => {
      const {valid, errorMessage, invoice, amount: amountInvoice, amountless, memo: memoInvoice, paymentType, address, sameNode,} = validPayment(destination, network, store.myPubKey, store.username)
      
      if (valid) {
        setStatus("idle")
        setAddress(address)
        setPaymentType(paymentType)
        setInvoice(invoice)
        setInitAmount(amountInvoice)
        setAmountless(amountless)

        if (!amountless) {
          setAmount(amountInvoice)
        }

        if (!memo) {
          setMemo(memoInvoice)
        }
    
        setInitialMemo(memo)
        setInteractive(false)

        switch(paymentType) {
          case "lightning":


            if(sameNode) { 
              setFee(0)
              return 
            }
            
            if (amountless && amount == 0) {
              setFee(null)
              return
            }

            try {
              const query = `mutation lightning_fees($invoice: String, $amount: Int){
                invoice {
                  getFee(amount: $amount, invoice: $invoice)
                }
              }`
              setFee(undefined)
              const { invoice: { getFee: fee }} = await store.mutate(query, { invoice, amount: amountless ? amount : undefined })
              setFee(fee)
            } catch (err) {
              console.tron.warn({err, message: "error getting lightning fees"})
              setFee(-1)
            }
            
            return 
          case "onchain":
            try {
              const query = `mutation onchain_fees($address: String!){
                onchain {
                  getFee(address: $address)
                }
              }`
              setFee(undefined)
              const { onchain: { getFee: fee }} = await store.mutate(query, { address })
              setFee(fee)
            } catch (err) {
              console.tron.warn({err, message: "error getting onchains fees"})
              setFee(-1)
            }

          return
        }

      } else if (!!errorMessage) {

        setPaymentType(paymentType)
        setInvoiceError(errorMessage)
        setInvoice(destination)

      } else {

        // it's kind of messy rn, but we need to check for more than just the regex, becuase we may have lightning:, bitcoin: also
        if (potentialBitcoinOrLightning) {
          return
        }

        setPaymentType("username")

        if (destination?.length > 2) {
          setQuery((store) => store.queryUsernameExists({username: destination}, {fetchPolicy: "cache-first"}))
        }

        setFee(null)
      }
    }

    fn()
  }, [destination, amount])
  
  const pay = async () => {
    if ((amountless || paymentType === "onchain") && amount === 0) {
      setStatus("error")
      setErrs([{message: translate("SendBitcoinScreen.noAmount")}])
      return
    }

    setErrs([])
    setStatus("loading")

    try {

      let optMemo = undefined
      if (initialMemo !== memo) {
        optMemo = memo
      }

      const { success, pending, errors } = await store.sendPayment({paymentType, invoice, amountless, optMemo, address, amount, username: destination})

      if (success) {
        store.queryWallet()
        setStatus("success")
      } else if (pending) {
        setStatus("pending")
      } else {
        setStatus("error")
        setErrs(errors)
      }

    } catch (err) {
      console.tron.log({err}, "error loop")
      setStatus("error")
      setErrs([{message: `an error occured. try again later\n${err}`}])
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

  const feeTextFormatted = textCurrencyFormatting(fee ?? 0, price, store.prefCurrency)

  const feeText = fee === null && !usernameExists ?
    "" :
    fee > 0 && !!amount ?
      `${feeTextFormatted}, ${translate("common.Total")}: ${textCurrencyFormatting(fee + amount, price, store.prefCurrency)}`:
      fee === -1 || fee === undefined ?
        fee:
        feeTextFormatted

  const totalAmount = fee == null ? amount: amount + fee
  const errorMessage = !!invoiceError ? 
    invoiceError:
    !!totalAmount && balance && totalAmount > balance && status !== "success" ?
      translate("SendBitcoinScreen.totalExceed", {balance: textCurrencyFormatting(balance, price, store.prefCurrency)}) :
      null

  return <SendBitcoinScreenJSX status={status} paymentType={paymentType} amountless={amountless}
    initAmount={initAmount} setAmount={setAmount} setStatus={setStatus} invoice={invoice} 
    address={address} memo={memo} errs={errs} amount={amount} goBack={goBack} pay={pay}
    price={price} 
    prefCurrency={store.prefCurrency} 
    fee={feeText}
    setMemo={setMemo}
    nextPrefCurrency={store.nextPrefCurrency}
    setDestination={setDestination}
    destination={destination}
    usernameExists={usernameExists}
    loadingUserNameExist={loadingUserNameExist}
    interactive={interactive}
    potentialBitcoinOrLightning={potentialBitcoinOrLightning}
    errorMessage={errorMessage}
    reset={reset}
  />
})


export const SendBitcoinScreenJSX = ({
  status, paymentType, amountless, initAmount, setAmount, setStatus, invoice, fee,
  address, memo, errs, amount, goBack, pay, price, prefCurrency, nextPrefCurrency, 
  setMemo, setDestination, destination, usernameExists, loadingUserNameExist, interactive,
  potentialBitcoinOrLightning, errorMessage, reset }) => {

    return <Screen style={styles.mainView} preset="scroll">
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
        placeholder={translate(`SendBitcoinScreen.input`)}
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.to")}</Text>
            <Icon name="ios-log-out" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        onChangeText={setDestination}
        rightIcon={
          destination?.length > 2 && !potentialBitcoinOrLightning && paymentType === "username" ?
            loadingUserNameExist ? 
              <ActivityIndicator size="small" /> :
              usernameExists ?
                <Text>✅</Text> :
                <Text>⚠️</Text> :
            paymentType === "lightning" || paymentType === "onchain" ?
              <Icon name="ios-close-circle-outline"
                // size={styles.icon.fontSize}
                onPress={reset}
                size={30}
                // color={color}
              />  :
              null
          }
        value={paymentType === "lightning" ? invoice : paymentType === "onchain" ? address : destination}
        renderErrorMessage={false}
        editable={interactive}
        selectTextOnFocus={true}
        autoCompleteType="username"
        autoCapitalize="none"
        // InputComponent={(props) => <Text {...props} selectable={true}>{props.value}</Text>}
      />
      <Input
        placeholder={translate(`SendBitcoinScreen.note`)}
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.note")}</Text>
            <Icon name="ios-create-outline" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        value={memo}
        onChangeText={value => setMemo(value)}
        renderErrorMessage={false}
        editable={true}
        selectTextOnFocus={true}
        // InputComponent={(props) => <Text {...props} selectable={true}>{props.value}</Text>}
      />
      <Input
        placeholder={translate(`SendBitcoinScreen.fee`)}
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.Fee")}</Text>
            <Icon name="ios-pricetag" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        value={fee}
        errorMessage={errorMessage}
        errorStyle={{fontSize: 16, alignSelf: "center", height: 18}}
        editable={false}
        selectTextOnFocus={true}
        InputComponent={props => fee === undefined ?
          <ActivityIndicator animating={true} size="small" color={palette.orange} /> :
          fee === -1 ?
            <Text>{translate("SendBitcoinScreen.feeCalculationUnsuccesful")}</Text>: // todo: same calculation as backend 
            <TextInput {...props} />
        }
      />
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
          {errs.map(({message}) => <Text style={styles.errorText}>{message}</Text>)}
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
      title={(status === "success" || status === "pending") ? 
        translate("common.close") : 
        errs.length !== 0 ? 
          translate("common.tryAgain") :
          !amount ?
            translate("common.amountRequired") :
            !destination ?
              translate("common.usernameRequired"):
              translate("common.send")} 
      onPress={() => (status === "success" || status === "pending") ? goBack() : pay()}
      disabled={!amount || !!errorMessage || !destination}
      loading={status === "loading"}
    />
  </Screen>
}
