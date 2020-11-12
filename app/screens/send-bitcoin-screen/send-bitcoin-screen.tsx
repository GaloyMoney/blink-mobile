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


export const SendBitcoinScreen: React.FC = observer(({ route }) => {
  const store = React.useContext(StoreContext)

  const [errs, setErrs] = useState([])
  const [address, setAddress] = useState("")
  const [paymentType, setPaymentType] = useState<IPaymentType>(undefined)
  const [amountless, setAmountless] = useState(false)
  const [initAmount, setInitAmount] = useState(0)
  const [amount, setAmount] = useState(0)
  const [username, setUsername] = useState("")
  const [invoice, setInvoice] = useState("")
  const [memo, setMemo] = useState("")
  const [initialMemo, setInitialMemo] = useState("")
  const [fee, setFee] = useState(null)
  
  const [status, setStatus] = useState("idle")
  // idle, loading, pending, success, error 

  const { error: errorQuery, loading: loadingUserNameExist, data, setQuery } = useQuery()
  const usernameExists = data?.usernameExists ?? false

  useEffect(() => {

    const {valid, invoice, amount, amountless, memo, paymentType, address} = validPayment(route.params?.payment, new Token().network, store.myPubKey, store.username)
    
    // this should be valid. Invoice / Address should be check before we show this screen
    // assert(valid)

    if (paymentType) {
      setStatus("idle")
      setAddress(address)
      setPaymentType(paymentType)
      setInvoice(invoice)
      setAmount(amount)
      setInitAmount(amount)
      setAmountless(amountless)
  
      setInitialMemo(memo)
      setMemo(memo)
  
      getFee()
    } else {
      setPaymentType("username")
      setFee(0)
    }

  }, [route.params?.payment])

  useEffect(() => {
    if (username !== "") {
      setQuery((store) => store.queryUsernameExists({username}, {fetchPolicy: "cache-first"}))
    }
  }, [username])

  useEffect(() => {
    getFee()
  }, [address])
  
  const getFee = async () => {
    if (!address) {
      return
    }

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

      
      console.tron.log({msg:"send payment"})

      const { success, pending, errors } = await store.sendPayment({paymentType, invoice, amountless, optMemo, address, amount, username})

      if (success) {
        store.queryWallet()
        setStatus("success")
        analytics().logSpendVirtualCurrency({value: amount, virtual_currency_name: "btc", item_name: "lightning"})
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
  const feeText = fee == null ? fee : textCurrencyFormatting(fee, price, store.prefCurrency)

  return <SendBitcoinScreenJSX status={status} paymentType={paymentType} amountless={amountless}
    initAmount={initAmount} setAmount={setAmount} setStatus={setStatus} invoice={invoice} 
    address={address} memo={memo} errs={errs} amount={amount} goBack={goBack} pay={pay}
    price={price} 
    prefCurrency={store.prefCurrency} 
    fee={feeText}
    setMemo={setMemo}
    nextPrefCurrency={store.nextPrefCurrency}
    setUsername={setUsername}
    username={username}
    usernameExists={usernameExists}
    loadingUserNameExist={loadingUserNameExist}
  />
})


export const SendBitcoinScreenJSX = ({
  status, paymentType, amountless, initAmount, setAmount, setStatus, invoice, fee,
  address, memo, errs, amount, goBack, pay, price, prefCurrency, nextPrefCurrency, 
  setMemo, setUsername, username, usernameExists, loadingUserNameExist }) => {

    return <Screen style={styles.mainView} preset={"scroll"}>
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
        placeholder={translate(`common.${paymentType}`)}
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.to")}</Text>
            <Icon name="ios-log-out" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        onChangeText={setUsername}
        rightIcon={paymentType === "username" && username !== "" ? loadingUserNameExist ? <ActivityIndicator size="small" /> :
          usernameExists ? <Text>✅</Text> : <Text>⚠️</Text> :
          null}
        value={paymentType === "lightning" ? invoice : paymentType === "onchain" ? address : username}
        renderErrorMessage={false}
        editable={paymentType === "username"}
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
      {paymentType !== "lightning" && 
      <Input
        leftIcon={
          <View style={{flexDirection: "row"}}>
            <Text style={styles.smallText}>{translate("common.Fee")}</Text>
            <Icon name="ios-pricetag" size={24} color={color.primary} style={styles.icon} />
          </View>
        }
        value={fee}
        renderErrorMessage={false}
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
            {errs.map(({message}) => <Text style={styles.errorText}>{message}</Text>)}
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
      title={(status === "success" || status === "pending") ? 
        translate("common.close") : 
        errs.length !== 0 ? 
          translate("common.tryAgain") :
          !amount ?
            translate("common.amountRequired") :
            translate("common.send")} // TODO refactor
      onPress={() => (status === "success" || status === "pending") ? goBack() : pay()}
      disabled={!amount}
      loading={status === "loading"}
    />
  </Screen>
}
