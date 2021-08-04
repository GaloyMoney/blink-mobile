import { useApolloClient } from "@apollo/client"
import { toInteger } from "lodash"
import * as React from "react"
import { Keyboard, Text, View } from "react-native"
import { TextInput } from "react-native-vector-icons/node_modules/@types/react-native/index"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { btc_price } from "../../graphql/query"
import { usePrefCurrency } from "../../hooks/usePrefCurrency"
import { palette } from "../../theme/palette"
import type { ComponentType } from "../../types/jsx"
import {
  CurrencyConversion,
  currencyToText,
  textToCurrency,
} from "../../utils/currencyConversion"
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

  inputMaskPositioning: {
    marginHorizontal: "15%",
    position: "absolute",
    width: "70%",
  },

  inputText: {
    opacity: 0,
  },

  main: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: "20rem",
  },

  subCurrencyText: {
    color: palette.midGrey,
    fontSize: "16rem",
    marginTop: 0,
    paddingTop: 0,
  },

  textStyle: {
    color: palette.darkGrey,
    fontSize: "35rem",
    fontWeight: "bold",
    textAlign: "center",
  },

  textStyleIcon: {
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
  const [amount, setAmount] = React.useState(initAmount)
  const [input, setInput] = React.useState("")
  const mapping = CurrencyConversion(price)
  const amountInput = mapping[prefCurrency].conversion(amount)
  const currency = mapping[prefCurrency].primary

  const handleTextInputChange = (text) => {
    setInput(textToCurrency(text, currency))
  }

  React.useEffect(() => {
    setAmount(initAmount)
  }, [initAmount])

  React.useEffect(() => {
    const newAmount = mapping[prefCurrency].reverse(+input)
    if (!isNaN(newAmount)) {
      setAmount(newAmount)
      onUpdateAmount(toInteger(newAmount))
    }
    // note: adding additional dependencies here breaks the input field
    // when switching between usd & sats
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  // is Focused part

  React.useEffect(() => {
    // TODO: show "an amount is needed" in red
    if (forceKeyboard && +amountInput == 0) {
      inputRef?.current.focus()
    }
  }, [forceKeyboard, amountInput])

  const inputRef = React.useRef<TextInput>()

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
  const displayValue = currencyToText(amountInput, currency)
  console.log("%%~~~~~~~~~~~~~~~")
  console.log(displayValue)

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text
          ellipsizeMode="middle"
          numberOfLines={1}
          style={[styles.textStyle, styles.inputMaskPositioning]}
        >
          {displayValue}
        </Text>
        <Input
          ref={inputRef}
          autoFocus={forceKeyboard}
          value={displayValue}
          leftIcon={
            currency === CurrencyType.USD ? (
              <Text
                style={[
                  styles.textStyleIcon,
                  { color: amount === 0 ? palette.midGrey : palette.darkGrey },
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
                  styles.textStyleIcon,
                  { color: amount === 0 ? palette.midGrey : palette.darkGrey },
                ]}
              >
                BTC
              </Text>
            ) : currency === "sats" ? (
              <Text
                style={[
                  styles.textStyleIcon,
                  { color: amount === 0 ? palette.midGrey : palette.darkGrey },
                ]}
              >
                sats
              </Text>
            ) : null
          }
          inputContainerStyle={styles.inputContainer}
          inputStyle={[styles.textStyle, styles.inputText]}
          contextMenuHidden
          onChangeText={handleTextInputChange}
          keyboardType={"number-pad"}
          onBlur={onBlur}
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
