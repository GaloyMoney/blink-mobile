import * as React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { StyleProp, Text, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { TextCurrency } from "../text-currency/text-currency"

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
    alignItems: "flex-end",
    flexDirection: "row",
  },

  header: {
    alignItems: "center",
    marginBottom: "32rem",
    marginTop: "32rem",
  },

  subCurrencyText: {
    color: palette.darkGrey,
    fontSize: "16rem",
  },

  text: {
    color: palette.darkGrey,
    fontSize: 32,
  },
})

export interface BalanceHeaderProps {
  currency: CurrencyType
  amount: number
  amountOtherCurrency?: number
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

const Loader = () => (
  <ContentLoader
    height={40}
    width={120}
    speed={1.2}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Rect x="0" y="12" rx="4" ry="4" width="120" height="28" />
    {/* <Rect x="30" y="35" rx="4" ry="4" width="60" height="10" /> */}
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  currency,
  amount,
  amountOtherCurrency = null,
  loading = false,
  style,
}: BalanceHeaderProps) => {
  const otherCurrency = currency === "BTC" ? "USD" : "BTC"

  const subHeader =
    amountOtherCurrency !== null ? (
      <TextCurrency
        amount={amountOtherCurrency}
        currency={otherCurrency}
        style={styles.subCurrencyText}
      />
    ) : null

  return (
    <View style={[styles.header, style]}>
      <Text style={styles.balanceText}>{translate("BalanceHeader.currentBalance")}</Text>
      <View style={styles.amount}>
        <View style={styles.container}>
          {loading && <Loader />}
          {!loading && (
            <TextCurrency amount={amount} currency={currency} style={styles.text} />
          )}
        </View>
        {!loading && subHeader}
      </View>
    </View>
  )
}
