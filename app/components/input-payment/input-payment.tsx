import { toInteger } from "lodash"
import { observer } from "mobx-react"
import * as React from "react"
import { Keyboard, Text, View } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { CurrencyConversion } from "../../utils/currencyConversion"
import { CurrencyType } from "../../utils/enum"
import { TextCurrency } from "../text-currency/text-currency"

const styles = EStyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
  },

  main: {
    alignItems: "center",
    marginTop: "8rem",
    width: "100%",
  },

  subCurrencyText: {
    fontSize: "18rem",
    color: palette.midGrey,
    marginTop: 0,
    paddingTop: 0,
  },

  textStyle: {
    fontSize: "24rem",
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

export const InputPaymentDataInjected = observer((props: InputPaymentDataInjectedProps) => {
  const store = React.useContext(StoreContext)
  const price = store.rate(CurrencyType.BTC)

  return <InputPayment 
    price={price} 
    prefCurrency={store.prefCurrency}
    nextPrefCurrency={store.nextPrefCurrency}
    {...props} />
})

export const InputPayment = ({
  price,
  editable,
  onUpdateAmount,
  onBlur = () => {},
  forceKeyboard = false,
  prefCurrency,
  nextPrefCurrency,
  initAmount = 0, // in sats
}) => {

  const endByDot = (s: string) => s.match(/^[0-9]*\.{1}$/)

  const [amount, setAmount] = React.useState(initAmount)
  const [input, setInput] = React.useState("")
  const [appendDot, setAppendDot] = React.useState(false)

  const mapping = CurrencyConversion(price)

  React.useEffect(() => {
    setAmount(initAmount)
  }, [initAmount])

  React.useEffect(() => {
    setAppendDot(!!endByDot(input))
    const newAmount = mapping[prefCurrency].reverse(+input)
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

  const amountInput = mapping[prefCurrency].conversion(amount)
  const currency = mapping[prefCurrency].primary


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

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={styles.main}>
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
          // keyboardFocus()
        }}
        enablesReturnKeyAutomatically={true}
        returnKeyLabel="Update"
        returnKeyType="done"
        editable={editable}
        onEndEditing={onBlur}
        renderErrorMessage={false}
      />
        <TextCurrency
          amount={mapping[prefCurrency].secondaryConversion(amount)}
          currency={mapping[prefCurrency].secondary}
          style={styles.subCurrencyText}
        />
      </View>
      <TouchableOpacity onPress={nextPrefCurrency}>
        <Icon name={"ios-swap-vertical"} size={32} style={{top: -4}} />
      </TouchableOpacity>
    </View>
  )
}
