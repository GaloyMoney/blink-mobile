import { indexOf } from "lodash"
import * as React from "react"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableHighlight, TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import { InputCurrency, TextCurrency } from "../text-currency/text-currency"



const styles = EStyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
    height: 42, // FIXME should be dynamic?
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
    marginBottom: "32rem",
    marginTop: "32rem",
  },

  subCurrencyText: {
    fontSize: "16rem",
    color: palette.darkGrey
  }
})

export interface InputPaymentProps {
  price: number // sats/usd
  initAmount?: number
  currencyPreference?: string // "sats" | "BTC" | "usd"
}

export const InputPayment: React.FC<InputPaymentProps> = ({
  price, // USDSAT
  initAmount = 0, // in sats
  currencyPreference = "sats"
}) => {

  const [pref, setPref] = React.useState(currencyPreference)
  const [amount, setAmount] = React.useState(initAmount)
  const [appendDot, setAppendDot] = React.useState(false)

  const mapping = {
    "USD": {
      primary: "USD",
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
              setAppendDot(endByDot(amount))
              setAmount(mapping[pref].reverse(+amount))
            }}
            // setAmount={amount => setAmount(mapping[pref].reverse(isNaN(+amount) ? 0 : +amount))}
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