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
    marginTop: "8rem",
  },

  subCurrencyText: {
    fontSize: "18rem",
    color: palette.darkGrey,
    marginTop: 0,
    paddingTop: 0,
    position: "relative",
    top: -18, // FIXME
  },

  textStyle: {
    fontSize: 24,
    color: palette.darkGrey
  }
})


const InputCurrency = ({ amount, setAmount, currency, onBlur, forceKeyboard, appendDot, editable }) => {
  const inputRef = React.useRef()

  React.useEffect(() => {
    keyboardFocus()
  }, [editable, amount])

  // TODO: show "an amount is needed" in red
  function keyboardFocus() {
    if (amount == "" || amount == "." || +amount == 0.) {
      inputRef?.current.focus()
    }
  }

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

  return <Input
    ref={inputRef}
    placeholder={"set an amount"}
    autoFocus={true}
    value={value}
    leftIcon={currency === CurrencyType.USD ? <Text style={styles.textStyle}>$</Text> : null}
    rightIcon={currency === CurrencyType.BTC ? 
      <Text style={styles.textStyle}>BTC</Text> :
      currency === "sats" ?
        <Text style={styles.textStyle}>sats</Text> :
        null}
    inputContainerStyle={{width: 250}}
    inputStyle={[styles.textStyle, {textAlign: "center"}]}
    onChangeText={setAmount}
    keyboardType={currency === "sats" ? "number-pad": "decimal-pad"}
    onBlur={(event) => {onBlur(event); forceKeyboard ? keyboardFocus() : null}}
    enablesReturnKeyAutomatically={true}
    returnKeyLabel="Update"
    returnKeyType="done"
    editable={editable}
  />
}


export interface InputPaymentDataInjectedProps {
  editable: boolean,
  onUpdateAmount(number): void
  onBlur?(): void
  forceKeyboard: boolean,
  initAmount?: number
  currencyPreference?: string // "sats" | "BTC" | "usd"
}

export const InputPaymentDataInjected = (props: InputPaymentDataInjectedProps) => {
  const store = React.useContext(StoreContext)
  const price = store.rate(CurrencyType.BTC)
  
  return <InputPayment price={price} {...props} />
}

export const InputPayment = ({
  price,
  onUpdateAmount,
  editable,
  onBlur = () => {},
  forceKeyboard = false,
  initAmount = 0, // in sats
  currencyPreference = "USD"
}) => {

  React.useEffect(() => {
    setAmount(initAmount)
  }, [initAmount])

  const [unit, setUnit] = React.useState(currencyPreference)
  const [amount, setAmount] = React.useState(initAmount)
  const [appendDot, setAppendDot] = React.useState(false)

  const mapping = {
    "USD": {
      primary: "USD",
      // TODO refactor: other place could use those conversions
      conversion: sats => (sats * price < 0.01) ? (sats * price).toFixed(4) : (sats * price).toFixed(2),
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
    const units = ["sats", "BTC", "USD"]
    const currentIndex = indexOf(units, unit)
    const nextCurrency = units[(currentIndex + 1) % 3]
    setUnit(nextCurrency)
  }

  return (
    // FIXME style
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%", paddingLeft: 32 }}> 
      <View style={styles.header}>
        <InputCurrency
          amount={mapping[unit].conversion(amount)} 
          currency={mapping[unit].primary}
          appendDot={appendDot}
          setAmount={amount => {
            function endByDot(s) {
              var rgx = /^[0-9]*\.{1}$/;
              return s.match(rgx);
            }
            setAppendDot(!!endByDot(amount))
            const newAmount = mapping[unit].reverse(+amount)
            if (!isNaN(newAmount)) {
              setAmount(newAmount)
              onUpdateAmount(toInteger(newAmount))
            }
          }}
          editable={editable}
          onBlur={onBlur} 
          forceKeyboard={forceKeyboard}
        />
        <TextCurrency
          amount={mapping[unit].secondaryConversion(amount)} 
          currency={mapping[unit].secondary}
          style={styles.subCurrencyText} />
      </View>
      <TouchableOpacity onPress={next}>
        <Icon name={"ios-swap-vertical"} size={32} />
      </TouchableOpacity>
    </View>
  )
}