import * as currency_fmt from "currency.js"
import * as React from "react"
import { Text, View } from "react-native"
import { Input } from "react-native-elements"
import { CurrencyType } from "../../utils/enum"

export const TextCurrency = ({ amount, currency, style }) => {
  if (currency === CurrencyType.USD) {
    return (
      <Text style={style}>
        {currency_fmt.default(amount, {
          formatWithSymbol: true, precision: (amount < 0.01 && amount !== 0) ? 4 : 2 }).format()
        }
      </Text>
    )
  } if (currency === CurrencyType.BTC) {
    return (
      <View style={{ flexDirection: "row", alignItems: "flex-end"}}>
        <Text style={style}>{currency_fmt.default(amount, { precision: 0, separator: "," }).format()} </Text>
        <Text style={[style, {fontSize: 24}]}>BTC</Text>
      </View>
    )
  } else { // if (currency === "sats") {
    return (
      <>
        <Text style={style}>
          {currency_fmt.default(amount, { precision: 0, separator: "," }).format()} sats
        </Text>
      </>
    )
  }
}

export const InputCurrency = ({ amount, setAmount, currency, style, appendDot, onSubmitEditing, editable }) => {
  let value 
  if (amount === 0 || isNaN(amount)) {
    value = ""
  } else {
    value = String(+amount)
  }

  // only add dot for for non-sats. 
  if ((currency === CurrencyType.USD || currency === CurrencyType.BTC) && appendDot) {
    value += "."
  }

  return <Input
    placeholder={"enter amount"}
    autoFocus={true}
    value={value}
    leftIcon={currency === CurrencyType.USD ? <Text style={style}>$</Text> : null}
    rightIcon={currency === CurrencyType.BTC ? 
      <Text style={style}>BTC</Text> :
      currency === "sats" ?
        <Text style={style}>sats</Text> :
        null}
    containerStyle={{width: 280}}
    inputStyle={style}
    onChangeText={setAmount}
    keyboardType="decimal-pad"
    onSubmitEditing={onSubmitEditing}
    returnKeyType="done"
    editable={editable}
  />
}
