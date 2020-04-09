import * as React from "react"
import { View, StyleSheet, Text } from "react-native"
import { color } from "../../theme"

import { CurrencyType } from "../../utils/enum"

import ContentLoader, { Rect } from "react-content-loader/native"
import { TextCurrency } from "../text-currency/text-currency"
import { translate } from "../../i18n"

const styles = StyleSheet.create({
  amount: {
    alignItems: "center",
    flexDirection: "column",
    height: 42, // FIXME should be dynamic?
  },

  balanceText: {
    color: color.text,
    fontSize: 16,
    marginBottom: 8,
  },

  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    marginBottom: 64,
    marginTop: 32,
  },
})

export interface BalanceHeaderProps {
  currency: CurrencyType
  amount: number
  amountOtherCurrency?: number
  initialLoading?: boolean
}

const Loader = () => (
  <ContentLoader height={50} width={120} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
    <Rect x="0" y="0" rx="4" ry="4" width="120" height="20" />
    <Rect x="30" y="35" rx="4" ry="4" width="60" height="10" />
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  currency,
  amount,
  amountOtherCurrency = null,
}) => {
  const initialLoading = isNaN(amount)
  const otherCurrency = currency === CurrencyType.BTC ? CurrencyType.USD : CurrencyType.BTC

  const subHeader =
    amountOtherCurrency !== null ? (
      <TextCurrency amount={amountOtherCurrency} currencyUsed={otherCurrency} fontSize={16} />
    ) : null

  return (
    <View style={styles.header}>
      <Text style={styles.balanceText}>{translate("BalanceHeader.currentBalance")}</Text>
      <View style={styles.amount}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          {initialLoading && <Loader />}
          {!initialLoading && (
            <TextCurrency amount={amount} currencyUsed={currency} fontSize={32} />
          )}
        </View>
        {!initialLoading && subHeader}
      </View>
    </View>
  )
}
