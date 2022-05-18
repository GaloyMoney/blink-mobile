import { palette } from "@app/theme";
import { WalletType } from "@app/utils/enum";
import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet"
import { CurrencyTag } from "../currency-tag";
import * as currency_fmt from "currency.js"

type WalletSummaryProps = {
    walletType: WalletType
    usdBalanceInDollars: number
    btcBalanceInSats?: number
    amountType: "RECEIVE" | "SEND" | "BALANCE"
}

const amountTypeToSymbol = {
    "RECEIVE":"+",
    "SEND":"-",
    "BALANCE":""
}

const styles = EStyleSheet.create({
    walletSummaryContainer: {
        backgroundColor: palette.white,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10
    },
    amountsContainer: {
        margin: 8
    },
    currencyTagContainer: {
        margin: 8
    },
    walletTitle: {
        fontSize: 14,
        fontWeight: 'bold'
    }
})

export const WalletSummary: FunctionComponent<WalletSummaryProps> = ({ walletType, usdBalanceInDollars, btcBalanceInSats, amountType = "BALANCE" }) => {

    const currencySpecificValues = walletType === WalletType.BTC ? {
        currencyName: "BTC",
        currencyColor: palette.btcPrimary,
        walletName: "Bitcoin Wallet",
    } : {
        currencyName: "USD",
        currencyColor: palette.usdPrimary,
        walletName: "US Dollar Wallet"
    }

    const formattedUsdAmount = currency_fmt.default(usdBalanceInDollars, {
      precision: 2,
      separator: ",",
      symbol: "$",
    })
    .format()

    const formattedBtcAmount = btcBalanceInSats ? currency_fmt.default(btcBalanceInSats, {
          precision: 0,
          separator: ",",
          symbol: "",
        }).format() + " sats" : ""

    const amounts = formattedBtcAmount ? formattedUsdAmount + " - " + formattedBtcAmount : formattedUsdAmount

    return (
        <View style={styles.walletSummaryContainer}>
            <View style={styles.currencyTagContainer}>
                <CurrencyTag walletType={walletType} />
            </View>
            <View style={styles.amountsContainer}>
                <Text style={styles.walletTitle}>{currencySpecificValues.walletName}</Text>
                <Text>{amountTypeToSymbol[amountType] ? `${amountTypeToSymbol[amountType]} ` : ""}{amounts}</Text>
            </View>
        </View>
    )

}
