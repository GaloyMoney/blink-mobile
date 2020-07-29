import { indexOf, toInteger } from "lodash"
import * as React from "react"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableHighlight, TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"
import { InputCurrency, TextCurrency } from "../text-currency/text-currency"



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
    width: "100%",
  },

  subCurrencyText: {
    fontSize: "16rem",
    color: palette.darkGrey,
    marginTop: 0,
    paddingTop: 0,
  }
})

export interface InputPaymentProps {
  onSubmitEditing(): void, 
  onUpdateAmount(number): void
  initAmount?: number
  currencyPreference?: string // "sats" | "BTC" | "usd"
}

export const InputPayment: React.FC<InputPaymentProps> = ({
  onUpdateAmount,
  onSubmitEditing,
  initAmount = 0, // in sats
  currencyPreference = "USD"
}) => {

  const [pref, setPref] = React.useState(currencyPreference)
  const [amount, setAmount] = React.useState(initAmount)
  const [appendDot, setAppendDot] = React.useState(false)

  const store = React.useContext(StoreContext)
  const price = store.rate(CurrencyType.BTC)

  const mapping = {
    "USD": {
      primary: "USD",

      // todo refactor
      conversion: sats => (sats * price).toFixed(2),
      reverse: usd => usd / price,
      secondary: "sats",
      secondaryConversion: sats => sats.toFixed(0)
    },
    "sats": {
      primary: "sats",
      conversion: sats => sats.toFixed(0),
      reverse: sats => sats,
      secondary: "USD",
      secondaryConversion: usd => (usd * price).toFixed(2)
    },
    "BTC": {
      digits: 8,
      primary: "BTC",
      conversion: sats => (sats / 10 ** 8).toFixed(8), // BigNum?
      reverse: btc => btc * 10 ** 8,
      secondary: "USD",
      secondaryConversion: usd => (usd * price).toFixed(2)
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
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
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
            onSubmitEditing={onSubmitEditing}
            style={{fontSize: 32, color: palette.darkGrey}} />
          <TextCurrency
            amount={mapping[pref].secondaryConversion(amount)} 
            currency={mapping[pref].secondary}
            style={styles.subCurrencyText} />
        </View>
      </View>
      <TouchableOpacity onPress={next}>
        <Icon name={"ios-swap"} size={32}  style={[styles.box, {
          transform: [{ rotate: "90deg" }]
        }]} />
      </TouchableOpacity>
    </View>
  )
}