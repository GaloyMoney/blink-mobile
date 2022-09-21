import * as React from "react"
import { useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import { TextCurrencyForAmount } from "../text-currency/text-currency"
import { useIsFocused } from "@react-navigation/native"
import { useHideBalance } from "../../hooks"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  balanceHeaderContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    height: 24,
  },
  balancesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    height: 24,
  },
  headerText: {
    color: palette.midGrey,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  marginBottom: {
    marginBottom: 4,
  },
  hiddenBalanceTouchableOpacity: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
  },
  hiddenBalanceIcon: {
    fontSize: "25rem",
  },
  secondaryBalanceText: {
    color: palette.darkGrey,
    fontSize: "16rem",
  },
  primaryBalanceText: {
    color: palette.darkGrey,
    fontSize: 32,
  },
})

export interface BalanceHeaderProps {
  hasUsdWallet: boolean
  loading?: boolean
  style?: StyleProp<ViewStyle>
  btcWalletBalance?: number
  btcWalletValueInUsd?: number
  usdWalletBalance?: number
}

const PrimaryLoader = () => (
  <ContentLoader
    height={40}
    width={100}
    speed={1.2}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Rect x="0" y="0" rx="4" ry="4" width="100" height="40" />
  </ContentLoader>
)

const SecondaryLoader = () => (
  <ContentLoader
    height={20}
    width={100}
    speed={1.2}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Rect x="0" y="0" rx="4" ry="4" width="100" height="20" />
  </ContentLoader>
)

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  hasUsdWallet,
  loading,
  btcWalletBalance,
  btcWalletValueInUsd,
  usdWalletBalance,
}: BalanceHeaderProps) => {
  const { LL } = useI18nContext()
  const hideBalance = useHideBalance()
  const isFocused = useIsFocused()
  const [balanceHidden, setBalanceHidden] = useState(hideBalance)
  const primaryBalance =
    btcWalletValueInUsd + (usdWalletBalance ? usdWalletBalance / 100 : 0)
  const secondaryBalanceEnabled = !hasUsdWallet
  const secondaryBalance = btcWalletBalance

  useEffect(() => {
    setBalanceHidden(hideBalance)
  }, [hideBalance, isFocused])

  return (
    <View style={styles.balanceHeaderContainer}>
      <View style={styles.header}>
        <Text testID="currentBalance" style={styles.headerText}>
          {LL.BalanceHeader.currentBalance()}
        </Text>
      </View>
      {balanceHidden ? (
        <TouchableOpacity
          onPress={() => setBalanceHidden(!balanceHidden)}
          style={styles.hiddenBalanceTouchableOpacity}
        >
          <Icon style={styles.hiddenBalanceIcon} name="eye" />
        </TouchableOpacity>
      ) : (
        <View style={styles.balancesContainer}>
          <TouchableOpacity onPress={() => setBalanceHidden(!balanceHidden)}>
            <View style={styles.marginBottom}>
              {loading ? (
                <PrimaryLoader />
              ) : (
                <TextCurrencyForAmount
                  style={styles.primaryBalanceText}
                  currency={"USD"}
                  amount={primaryBalance}
                />
              )}
            </View>
            <View>
              {secondaryBalanceEnabled && loading ? <SecondaryLoader /> : null}
              {secondaryBalanceEnabled && !loading ? (
                <TextCurrencyForAmount
                  currency={"BTC"}
                  style={styles.secondaryBalanceText}
                  amount={secondaryBalance}
                  satsIconSize={16}
                />
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer} />
    </View>
  )
}
