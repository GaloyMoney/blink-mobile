import { indexOf, toInteger } from "lodash"
import * as React from "react"
import { Dimensions, Keyboard, Text, View } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"
import { TextCurrency } from "../text-currency/text-currency"

const styles = EStyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
  },

  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    marginTop: "8rem",
    width: "100%"
  },

  subCurrencyText: {
    fontSize: "16rem",
    color: palette.midGrey,
    marginTop: 0,
    paddingTop: 0,
  },

  textStyle: {
    fontSize: "18rem",
    color: palette.darkGrey,
  },
})

export interface InputPaymentDataInjectedProps {
  editable: boolean
  onUpdateAmount(number): void
  onBlur?(): void
  forceKeyboard: boolean
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
  editable,
  onUpdateAmount,
  onBlur = () => {},
  forceKeyboard = false,
  initAmount = 0, // in sats
  currencyPreference = "USD",
}) => {

  const mapping = {
    USD: {
      primary: "USD",
      // TODO refactor: other place could use those conversions
      conversion: (sats) =>
        sats * price < 0.01 ? (sats * price).toFixed(4) : (sats * price).toFixed(2),
      reverse: (usd) => usd / price,
      secondary: "sats",
      secondaryConversion: (sats) => sats,
    },
    sats: {
      primary: "sats",
      conversion: (sats) => sats.toFixed(0),
      reverse: (sats) => sats,
      secondary: "USD",
      secondaryConversion: (sats) => sats * price,
    },
    BTC: {
      primary: "BTC",
      conversion: (sats) => (sats / 10 ** 8).toFixed(8), // BigNum?
      reverse: (btc) => btc * 10 ** 8,
      secondary: "USD",
      secondaryConversion: (sats) => sats * price,
    },
  }

  const endByDot = (s: string) => s.match(/^[0-9]*\.{1}$/)

  const [unit, setUnit] = React.useState(currencyPreference)
  const [amount, setAmount] = React.useState(initAmount)
  const [input, setInput] = React.useState("")
  const [appendDot, setAppendDot] = React.useState(false)

  React.useEffect(() => {
    setAmount(initAmount)
  }, [initAmount])

  React.useEffect(() => {
    setAppendDot(!!endByDot(input))
    const newAmount = mapping[unit].reverse(+input)
    if (!isNaN(newAmount)) {
      setAmount(newAmount)
      onUpdateAmount(toInteger(newAmount))
    }
  }, [input])

  console.tron.log({amount, input})

  // is Focused part

  React.useEffect(() => {
    keyboardFocus()
  }, [editable, amount])

  const inputRef = React.useRef()

  const amountInput = mapping[unit].conversion(amount)
  const currency = mapping[unit].primary


  // TODO: show "an amount is needed" in red
  function keyboardFocus() {
    if (forceKeyboard && (amountInput == "" || amountInput == "." || +amountInput == 0)) {
      inputRef?.current.focus()
    }
  }

  React.useEffect(() => {
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide)
    }
  }, [])

  const _keyboardDidHide = () => {
    inputRef?.current.blur()
  }

  const valueTweak = () => {
    let value 

    if (amountInput == 0 || isNaN(amountInput)) {
      value = ""
    } else {
      value = String(+amountInput)
    }
  
    // only add dot for for non-sats.
    if ((currency === CurrencyType.USD || currency === CurrencyType.BTC) && appendDot) {
      value += "."
    }

    return value
  }

  const next = () => {
    const units = ["sats", "USD"] // "BTC"
    const currentIndex = indexOf(units, unit)
    const nextCurrency = units[(currentIndex + 1) % units.length]
    setUnit(nextCurrency)
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={styles.header}>
        <Input
        ref={inputRef}
        placeholder={translate("common.setAnAmount")}
        autoFocus={forceKeyboard}
        value={valueTweak()}
        leftIcon={currency === CurrencyType.USD ? 
          <Text style={[styles.textStyle, {color: valueTweak() === "" ? palette.midGrey: palette.darkGrey}]}>$</Text>
          : null}
        rightIcon={
          currency === CurrencyType.BTC ? (
            <Text style={[styles.textStyle, {color: valueTweak() === "" ? palette.midGrey: palette.darkGrey}]}>BTC</Text>
          ) : currency === "sats" ? (
            <Text style={[styles.textStyle, {color: valueTweak() === "" ? palette.midGrey: palette.darkGrey}]}>sats</Text>
          ) : null
        }
        inputContainerStyle={{ width: "100%" }}
        inputStyle={[styles.textStyle, { textAlign: "center" }]}
        onChangeText={setInput}
        keyboardType={currency === "sats" ? "number-pad" : "decimal-pad"}
        onBlur={event => {
          onBlur()
          keyboardFocus()
        }}
        enablesReturnKeyAutomatically={true}
        returnKeyLabel="Update"
        returnKeyType="done"
        editable={editable}
        onEndEditing={onBlur}
        renderErrorMessage={false}
      />
        <TextCurrency
          amount={mapping[unit].secondaryConversion(amount)}
          currency={mapping[unit].secondary}
          style={styles.subCurrencyText}
        />
      </View>
      <TouchableOpacity onPress={next}>
        <Icon name={"ios-swap-vertical"} size={32} style={{top: -4}} />
      </TouchableOpacity>
    </View>
  )
}
