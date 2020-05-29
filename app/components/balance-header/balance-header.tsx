import * as React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { StyleSheet, Text, View } from "react-native"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { CurrencyType } from "../../utils/enum"
import { TextCurrency } from "../text-currency/text-currency"
import EStyleSheet from "react-native-extended-stylesheet"



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

export interface BalanceHeaderProps {
  currency: CurrencyType
  amount: number
  amountOtherCurrency?: number
  loading: boolean
}

const Loader = () => (
  <ContentLoader height={40} width={120} speed={1.2} 
    backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
    <Rect x="0" y="12" rx="4" ry="4" width="120" height="28"  />
    {/* <Rect x="30" y="35" rx="4" ry="4" width="60" height="10" /> */}
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  currency,
  amount,
  amountOtherCurrency = null,
  loading,
}) => {
  const otherCurrency = currency === CurrencyType.BTC ? CurrencyType.USD : CurrencyType.BTC

  const subHeader =
    amountOtherCurrency !== null ? (
      <TextCurrency amount={amountOtherCurrency} currency={otherCurrency} 
        style={styles.subCurrencyText} />
    ) : null

  return (
    <View style={styles.header}>
      <Text style={styles.balanceText}>{translate("BalanceHeader.currentBalance")}</Text>
      <View style={styles.amount}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          {loading && <Loader />}
          {!loading && (
            <TextCurrency amount={amount} currency={currency}
              style={{fontSize: 32, color: palette.darkGrey}} />
          )}
        </View>
        {!loading && subHeader}
      </View>
    </View>
  )
}