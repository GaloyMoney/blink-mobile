import React, { useState } from "react"
import { Platform, TouchableOpacity, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

import SwitchButton from "@app/assets/icons-redesign/transfer.svg"
import { AmountInput } from "@app/components/amount-input"
import { Screen } from "@app/components/screen"
import {
  useConversionScreenQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import {
  DisplayCurrency,
  lessThan,
  MoneyAmount,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  toWalletAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"

import { makeStyles, Text, useTheme } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { getUsdWallet } from "@app/graphql/wallets-utils"

// import Breez SDK Wallet
import { StackScreenProps } from "@react-navigation/stack"
import { useBreez, usePriceConversion } from "@app/hooks"

type Props = StackScreenProps<RootStackParamList, "conversionDetails">

export const ConversionDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { zeroDisplayAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()
  const { formatDisplayAndWalletAmount } = useDisplayCurrency()
  const { btcWallet } = useBreez()

  const [fromWalletCurrency, setFromWalletCurrency] = useState<WalletCurrency>("BTC")
  const [moneyAmount, setMoneyAmount] =
    useState<MoneyAmount<WalletOrDisplayCurrency>>(zeroDisplayAmount)

  useRealtimePriceQuery({
    fetchPolicy: "network-only",
  })

  const { data } = useConversionScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
  })

  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const btcBalance = toBtcMoneyAmount(btcWallet?.balance ?? NaN)
  const usdBalance = toUsdMoneyAmount(usdWallet?.balance ?? NaN)

  // @ts-ignore: Unreachable code error
  const convertedBTCBalance = convertMoneyAmount(btcBalance, DisplayCurrency) // @ts-ignore: Unreachable code error
  const convertedUsdBalance = convertMoneyAmount(usdBalance, DisplayCurrency) // @ts-ignore: Unreachable code error
  const settlementSendAmount = convertMoneyAmount(moneyAmount, fromWalletCurrency)

  const formattedBtcBalance = formatDisplayAndWalletAmount({
    displayAmount: convertedBTCBalance,
    walletAmount: btcBalance,
  })
  const formattedUsdBalance = formatDisplayAndWalletAmount({
    displayAmount: convertedUsdBalance,
    walletAmount: usdBalance,
  })

  const fromWalletBalance = fromWalletCurrency === "BTC" ? btcBalance : usdBalance

  const isValidAmount =
    settlementSendAmount.amount > 0 &&
    settlementSendAmount.amount <= fromWalletBalance.amount

  const canToggleWallet =
    fromWalletCurrency === "BTC" ? usdBalance.amount > 0 : btcBalance.amount > 0

  let amountFieldError: string | undefined = undefined

  if (
    lessThan({
      value: fromWalletCurrency === "BTC" ? btcBalance : usdBalance,
      lessThan: settlementSendAmount,
    })
  ) {
    amountFieldError = LL.SendBitcoinScreen.amountExceed({
      balance: fromWalletCurrency === "BTC" ? formattedBtcBalance : formattedUsdBalance,
    })
  }

  const toggleWallet = () => {
    setFromWalletCurrency(fromWalletCurrency === "BTC" ? "USD" : "BTC")
  }

  const setAmountToBalancePercentage = (percentage: number) => {
    const fromBalance =
      fromWalletCurrency === WalletCurrency.Btc ? btcBalance.amount : usdBalance.amount

    setMoneyAmount(
      toWalletAmount({
        amount: Math.round((fromBalance * percentage) / 100),
        currency: fromWalletCurrency,
      }),
    )
  }

  const moveToNextScreen = () => {
    if (usdWallet && btcWallet) {
      navigation.navigate("conversionConfirmation", {
        toWallet: fromWalletCurrency === "BTC" ? usdWallet : btcWallet,
        fromWallet: fromWalletCurrency === "BTC" ? btcWallet : usdWallet,
        moneyAmount: settlementSendAmount,
      })
    }
  }

  return (
    <Screen preset="fixed">
      <ScrollView style={styles.scrollViewContainer}>
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
        <View style={styles.fieldContainer}>
          <AmountInput
            unitOfAccountAmount={moneyAmount}
            walletCurrency={fromWalletCurrency}
            setAmount={setMoneyAmount}
            convertMoneyAmount={convertMoneyAmount as keyof typeof convertMoneyAmount}
          />
          {amountFieldError && (
            <View style={styles.errorContainer}>
              <Text color={colors.error}>{amountFieldError}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldContainer}>
          <View style={styles.percentageLabelContainer}>
            <Text style={styles.percentageFieldLabel}>
              {LL.TransferScreen.percentageToConvert()}
            </Text>
          </View>
          <View style={styles.percentageContainer}>
            <View style={styles.percentageFieldContainer}>
              <TouchableOpacity
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(25)}
              >
                <Text>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(50)}
              >
                <Text>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(75)}
              >
                <Text>75%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(100)}
              >
                <Text>100%</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <GaloyPrimaryButton
        title={LL.common.next()}
        containerStyle={styles.buttonContainer}
        disabled={!isValidAmount}
        onPress={moveToNextScreen}
      />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollViewContainer: {
    flex: 1,
    flexDirection: "column",
    margin: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
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
  percentageFieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    padding: 10,
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
  percentageFieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    flexWrap: "wrap",
  },
  percentageField: {
    backgroundColor: colors.grey5,
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    minWidth: 80,
  },
  percentageLabelContainer: {
    flex: 1,
  },
  percentageContainer: {
    flexDirection: "row",
  },
  buttonContainer: { marginHorizontal: 20, marginBottom: 20 },
  errorContainer: {
    marginTop: 10,
    alignItems: "center",
  },
}))
