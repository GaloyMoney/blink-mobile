import { palette } from "@app/theme";
import { WalletType } from "@app/utils/enum";
import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet"


const styles = EStyleSheet.create({
    currencyTag: {
        borderRadius: 10,
        height: 30,
        width: 50,
        justifyContent: 'center',
        alignItems:'center'
    },
    currencyText: {
        fontSize: 12,
    },
})

type CurrencyTagProps = {
    walletType: WalletType
}

export const CurrencyTag: FunctionComponent<CurrencyTagProps> = ({ walletType }) => {

    const currencyStyling = {
        "BTC": {
            textColor: palette.orangePill,
            backgroundColor: 'rgba(238, 133, 58, 0.2)'
        },
        "USD": {
            textColor: palette.violetteBlue,
            backgroundColor: "rgba(99, 116, 195, 0.2)"
        }
    }

    return (
        <View style={{ ...styles.currencyTag, backgroundColor: currencyStyling[walletType].backgroundColor }}>
            <Text style={{ ...styles.currencyText, color: currencyStyling[walletType].textColor }}>
                {walletType}
            </Text>
        </View>
    )
}
