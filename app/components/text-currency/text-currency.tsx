import * as currency_fmt from "currency.js"
import * as React from "react"
import {Text, TextStyle, TouchableHighlight, View} from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import type { ComponentType } from "../../types/jsx"
import { CurrencyType } from "../../utils/enum"
import {HIDE_BALANCE} from "../../screens/settings-screen/security-screen";
import {load} from "../../utils/storage";
import Icon from "react-native-vector-icons/Entypo"
import {useEffect, useState} from "react";
import { useIsFocused } from '@react-navigation/native';
import {palette} from "../../theme/palette";

const styles = EStyleSheet.create({
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  subCurrencyText: {
    color: palette.midGrey,
    fontSize: "22rem",
    marginTop: 0,
    paddingTop: 0,
  },

})

type Props = {
  amount: number
  currency: string
  style: TextStyle
}

export const TextCurrency: ComponentType = ({ amount, currency, style }: Props) => {
  const [hideBalance, setHideBalance] = useState(null)
  const isFocused = useIsFocused()

  const checkHideBalanceSettings = async() => {
        setHideBalance( await load(HIDE_BALANCE) )
  }

  useEffect( () => {
    checkHideBalanceSettings()
  },[isFocused])

  if ( hideBalance ) {
    return (
        <TouchableHighlight onPress={ ()=> { setHideBalance(null) }}>
          <Icon style={styles.subCurrencyText} name="eye" />
        </TouchableHighlight>
    )
  } else {
    if (currency === CurrencyType.USD) {
      return (
           <TouchableHighlight onPress={ ()=> { setHideBalance(true) }}>
          <Text style={style}>
            {currency_fmt
                .default(amount, {precision: amount < 0.01 && amount !== 0 ? 4 : 2})
                .format()}
          </Text>
             </TouchableHighlight>

      )
    }
    if (currency === CurrencyType.BTC) {
      return (
           <TouchableHighlight onPress={ ()=> { setHideBalance(true) }}>
          <View style={styles.container}>
            <Text style={style}>
              {currency_fmt
                  .default(amount, {precision: 0, separator: ",", symbol: ""})
                  .format()}{" "}
            </Text>
            {/* <Text style={[style, {fontSize: 24}]}>BTC</Text> */}
            <Text style={style}>BTC</Text>
          </View>
             </TouchableHighlight>
      )
    } // if (currency === "sats") {
    return (
         <TouchableHighlight onPress={ ()=> { setHideBalance(true) }}>
        <Text style={style}>
          {currency_fmt
              .default(amount, {
                formatWithSymbol: false,
                precision: 0,
                separator: ",",
                symbol: "",
              })
              .format()}{" "}
          sats
        </Text>
           </TouchableHighlight>
    )
  }
}
