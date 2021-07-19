import { useApolloClient } from "@apollo/client"
import { toInteger } from "lodash"
import * as React from "react"
import { Keyboard, Text, View } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { btc_price } from "../../graphql/query"
import { usePrefCurrency } from "../../hooks/usePrefCurrency"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import type { ComponentType } from "../../types/jsx"
import { CurrencyConversion } from "../../utils/currencyConversion"
import { CurrencyType } from "../../utils/enum"
import { TextCurrency } from "../text-currency/text-currency"

const styles = EStyleSheet.create({
  container: {
    alignItems: "center",
  },

  icon: {
    paddingTop: 4,
  },

  inputContainer: {
    width: "100%",
  },

  main: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: "8rem",
    width: "100%",
  },

  subCurrencyText: {
    color: palette.midGrey,
    fontSize: "16rem",
    marginTop: 0,
    paddingTop: 0,
  },

  textStyle: {
    color: palette.darkGrey,
    fontSize: "18rem",
    textAlign: "center",
  },
})

type InputPaymentDataInjectedProps = {
  price: number
  editable: boolean
  onUpdateAmount(number): void
  onBlur?(): void
  forceKeyboard: boolean
  initAmount?: number
  prefCurrency: string
  nextPrefCurrency: () => void
  currencyPreference?: string // "sats" | "BTC" | "usd"
  sub?: boolean
}

export const InputPaymentDataInjected: ComponentType = (
  props: InputPaymentDataInjectedProps,
) => {
  const client = useApolloClient()
  const price = btc_price(client)

  const [prefCurrency, nextPrefCurrency] = usePrefCurrency()

  return (
    <InputPayment
      price={price}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      {...props}
    />
  )
}

export const InputPayment: ComponentType = ({
  price,
  editable,
  onUpdateAmount,
  onBlur = () => null,
  forceKeyboard = false,
  sub = true,
  initAmount = 0, // in sats
  prefCurrency,
  nextPrefCurrency,
}: InputPaymentDataInjectedProps) => {
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
    inputRef?.current?.blur()
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
    <View style={styles.container}>
      <View style={styles.main}>
        <Input
          ref={inputRef}
          placeholder={translate("common.setAnAmount")}
          autoFocus={forceKeyboard}
          value={valueTweak()}
          leftIcon={
            currency === CurrencyType.USD ? (
              <Text
                style={[
                  styles.textStyle,
                  { color: valueTweak() === "" ? palette.midGrey : palette.darkGrey },
                ]}
              >
                $
              </Text>
            ) : null
          }
          rightIcon={
            currency === CurrencyType.BTC ? (
              <Text
                style={[
                  styles.textStyle,
                  { color: valueTweak() === "" ? palette.midGrey : palette.darkGrey },
                ]}
              >
                BTC
              </Text>
            ) : currency === "sats" ? (
              <Text
                style={[
                  styles.textStyle,
                  { color: valueTweak() === "" ? palette.midGrey : palette.darkGrey },
                ]}
              >
                sats
              </Text>
            ) : null
          }
          inputContainerStyle={styles.inputContainer}
          inputStyle={[styles.textStyle]}
          onChangeText={setInput}
          keyboardType={currency === "sats" ? "number-pad" : "decimal-pad"}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onBlur={(event) => {
            onBlur()
            // keyboardFocus()
          }}
          enablesReturnKeyAutomatically
          returnKeyLabel="Update"
          returnKeyType="done"
          editable={editable}
          onEndEditing={onBlur}
          renderErrorMessage={false}
        />
        <TouchableOpacity onPress={nextPrefCurrency}>
          <Icon name="ios-swap-vertical" size={32} style={styles.icon} />
        </TouchableOpacity>
      </View>
      {sub && (
        <TextCurrency
          amount={mapping[prefCurrency].secondaryConversion(amount)}
          currency={mapping[prefCurrency].secondary}
          style={styles.subCurrencyText}
        />
      )}
    </View>
  )
}
