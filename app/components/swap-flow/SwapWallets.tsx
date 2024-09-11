import React from "react"
import { Platform, TouchableOpacity, View } from "react-native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"

// types
import { WalletCurrency } from "@app/graphql/generated"

// assets
import SwitchButton from "@app/assets/icons-redesign/transfer.svg"

type Props = {
  fromWalletCurrency: WalletCurrency
  formattedBtcBalance: string
  formattedUsdBalance: string
  canToggleWallet: boolean
  setFromWalletCurrency: (val: WalletCurrency) => void
}

const SwapWallets: React.FC<Props> = ({
  fromWalletCurrency,
  formattedBtcBalance,
  formattedUsdBalance,
  canToggleWallet,
  setFromWalletCurrency,
}) => {
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme
  const styles = useStyles()

  const toggleWallet = () => {
    setFromWalletCurrency(fromWalletCurrency === "BTC" ? "USD" : "BTC")
  }

  return (
    <View style={styles.walletSelectorContainer}>
      <View style={styles.walletsContainer}>
        <View style={styles.fromFieldContainer}>
          <View style={styles.walletSelectorInfoContainer}>
            {fromWalletCurrency === WalletCurrency.Btc ? (
              <Text
                style={styles.walletCurrencyText}
              >{`${LL.common.from()} ${LL.common.btcAccount()}`}</Text>
            ) : (
              <Text
                style={styles.walletCurrencyText}
              >{`${LL.common.from()} ${LL.common.usdAccount()}`}</Text>
            )}
            <View style={styles.walletSelectorBalanceContainer}>
              <Text>
                {fromWalletCurrency === WalletCurrency.Btc
                  ? formattedBtcBalance
                  : formattedUsdBalance}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.walletSeparator}>
          <View style={styles.line}></View>
          <TouchableOpacity
            style={styles.switchButton}
            disabled={!canToggleWallet}
            onPress={toggleWallet}
          >
            <SwitchButton color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.toFieldContainer}>
          <View style={styles.walletSelectorInfoContainer}>
            {fromWalletCurrency === WalletCurrency.Btc ? (
              <Text
                style={styles.walletCurrencyText}
              >{`${LL.common.to()} ${LL.common.usdAccount()}`}</Text>
            ) : (
              <Text
                style={styles.walletCurrencyText}
              >{`${LL.common.to()} ${LL.common.btcAccount()}`}</Text>
            )}
            <View style={styles.walletSelectorBalanceContainer}>
              <Text>
                {fromWalletCurrency === WalletCurrency.Btc
                  ? formattedUsdBalance
                  : formattedBtcBalance}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SwapWallets

const useStyles = makeStyles(({ colors }) => ({
  toFieldContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginRight: 75,
  },
  walletSelectorContainer: {
    flexDirection: "row",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  walletsContainer: {
    flex: 1,
  },
  walletSeparator: {
    flexDirection: "row",
    height: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  line: {
    backgroundColor: colors.grey4,
    height: 1,
    flex: 1,
  },
  switchButton: {
    height: 50,
    width: 50,
    borderRadius: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    backgroundColor: colors.grey4,
    justifyContent: "center",
    alignItems: "center",
  },
  fromFieldContainer: {
    flexDirection: "row",
    marginBottom: 15,
    marginRight: 75,
  },
  walletSelectorInfoContainer: {
    flex: 1,
    flexDirection: "column",
  },
  walletCurrencyText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
}))
