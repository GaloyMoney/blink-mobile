import { indexOf, toInteger } from "lodash"
import * as React from "react"
import { Text, View } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"
import { TextCurrency } from "../text-currency/text-currency"



const styles = EStyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
  },

  balanceText: {
    color: palette.midGrey,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    marginBottom: "16rem",
    marginTop: "16rem",
  },

  subCurrencyText: {
    fontSize: "16rem",
    color: palette.darkGrey,
    marginTop: 0,
    paddingTop: 0,
  },

  textStyle: {
    fontSize: 28,
    color: palette.darkGrey
  }
})

export interface InputPaymentDataInjectedProps {
  editable: boolean,
  onUpdateAmount(number): void
  onSubmitEditing?(): void, 
  initAmount?: number
  currencyPreference?: string // "sats" | "BTC" | "usd"
}

export const InputPaymentDataInjected = (props: InputPaymentDataInjectedProps) => {
  const store = React.useContext(StoreContext)
  const price = store.rate(CurrencyType.BTC)
  
  return <InputPayment price={price} {...props} />
}


const InputCurrency = ({ amount, setAmount, currency, appendDot, onSubmitEditing, editable }) => {
  let value 
  if (amount == 0 || isNaN(amount)) {
    value = ""
  } else {
    value = String(+amount)
  }

  // only add dot for for non-sats. 
  if ((currency === CurrencyType.USD || currency === CurrencyType.BTC) && appendDot) {
    value += "."
  }

  console.tron.log({amount})

  return <Input
    placeholder={"set an amount"}
    // autoFocus={true}
    value={value}
    leftIcon={currency === CurrencyType.USD ? <Text style={styles.textStyle}>$</Text> : null}
    rightIcon={currency === CurrencyType.BTC ? 
      <Text style={styles.textStyle}>BTC</Text> :
      currency === "sats" ?
        <Text style={styles.textStyle}>sats</Text> :
        null}
    containerStyle={{width: 240}}
    inputStyle={[styles.textStyle, {textAlign: "center"}]}
    onChangeText={setAmount}
    keyboardType="decimal-pad"
    onSubmitEditing={onSubmitEditing}
    returnKeyType="done"
    editable={editable}
  />
}


export const InputPayment = ({
  price,
  onUpdateAmount,
  onSubmitEditing = null,
  editable,
  initAmount = 0, // in sats
  currencyPreference = "USD"
}) => {

  const [pref, setPref] = React.useState(currencyPreference)
  const [amount, setAmount] = React.useState(initAmount)
  const [appendDot, setAppendDot] = React.useState(false)

  const mapping = {
    "USD": {
      primary: "USD",
      // TODO refactor: other place could use those conversions
      conversion: sats => (sats * price).toFixed(2),
      reverse: usd => usd / price,
      secondary: "sats",
      secondaryConversion: sats => sats
    },
    "sats": {
      primary: "sats",
      conversion: sats => sats.toFixed(0),
      reverse: sats => sats,
      secondary: "USD",
      secondaryConversion: sats => sats * price
    },
    "BTC": {
      primary: "BTC",
      conversion: sats => (sats / 10 ** 8).toFixed(8), // BigNum?
      reverse: btc => btc * 10 ** 8,
      secondary: "USD",
      secondaryConversion: sats => sats * price
    }
  }

  const next = () => {
    const loop = ["sats", "BTC", "USD"]
    const currentIndex = indexOf(loop, pref)
    const nextIndex = (currentIndex + 1) % 3
    const nextCurrency = loop[nextIndex]
    setPref(nextCurrency)
  }

  return (
    // FIXME style
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%", paddingLeft: 32 }}> 
      <View style={styles.header}>
        <View style={styles.amount}>
          <InputCurrency
            amount={mapping[pref].conversion(amount)} 
            currency={mapping[pref].primary}
            appendDot={appendDot}
            setAmount={amount => {
              function endByDot(s) {
                var rgx = /^[0-9]*\.{1}$/;
                return s.match(rgx);
              }
              setAppendDot(!!endByDot(amount))
              const newAmount = mapping[pref].reverse(+amount)
              if (!isNaN(newAmount)) {
                setAmount(newAmount)
                onUpdateAmount(toInteger(newAmount))
              }
            }}
            editable={editable}
            onSubmitEditing={onSubmitEditing} />
          <TextCurrency
            amount={mapping[pref].secondaryConversion(amount)} 
            currency={mapping[pref].secondary}
            style={styles.subCurrencyText} />
        </View>
      </View>
      <TouchableOpacity onPress={next}>
        <Icon name={"ios-swap-vertical"} size={32} />
      </TouchableOpacity>
    </View>
  )
}