import React, { useEffect } from "react"
import { Platform, Text, View, TouchableOpacity } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

import { gql } from "@apollo/client"
import SwitchButton from "@app/assets/icons/transfer.svg"
import { Screen } from "@app/components/screen"
import {
  useConversionScreenQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useConvertMoneyDetails } from "@app/screens/conversion-flow/use-convert-money-details"
import { palette } from "@app/theme"
import {
  DisplayCurrency,
  lessThan,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  toWalletAmount,
} from "@app/types/amounts"
import { testProps } from "@app/utils/testProps"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Button } from "@rneui/base"
import { makeStyles } from "@rneui/themed"
import { AmountInput } from "@app/components/amount-input"

gql`
  query conversionScreen {
    me {
      id
      defaultAccount {
        id
        usdWallet @client {
          id
          balance
          walletCurrency
        }
        btcWallet @client {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

export const ConversionDetailsScreen = () => {
  const styles = useStyles()
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "conversionDetails">>()

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
  })

  const { data } = useConversionScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
  })

  const { LL } = useI18nContext()
  const { formatDisplayAndWalletAmount } = useDisplayCurrency()

  const btcWallet = data?.me?.defaultAccount.btcWallet
  const usdWallet = data?.me?.defaultAccount.usdWallet

  const {
    fromWallet,
    toWallet,
    setWallets,
    settlementSendAmount,
    setMoneyAmount,
    convertMoneyAmount,
    isValidAmount,
    moneyAmount,
    canToggleWallet,
    toggleWallet,
  } = useConvertMoneyDetails(
    btcWallet && usdWallet
      ? { initialFromWallet: btcWallet, initialToWallet: usdWallet }
      : undefined,
  )

  useEffect(() => {
    if (!fromWallet && btcWallet && usdWallet) {
      setWallets({
        fromWallet: btcWallet,
        toWallet: usdWallet,
      })
    }
  }, [btcWallet, usdWallet, fromWallet, setWallets])

  if (!data?.me?.defaultAccount || !fromWallet) {
    // TODO: proper error handling. non possible event?
    return <></>
  }

  const btcWalletBalance = toBtcMoneyAmount(btcWallet?.balance ?? NaN)
  const usdWalletBalance = toUsdMoneyAmount(usdWallet?.balance ?? NaN)

  const fromWalletBalance =
    fromWallet.walletCurrency === WalletCurrency.Btc ? btcWalletBalance : usdWalletBalance
  const toWalletBalance =
    toWallet.walletCurrency === WalletCurrency.Btc ? btcWalletBalance : usdWalletBalance
  const fromWalletBalanceFormatted = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(fromWalletBalance, DisplayCurrency),
    walletAmount: fromWalletBalance,
  })

  const toWalletBalanceFormatted = formatDisplayAndWalletAmount({
    displayAmount: convertMoneyAmount(toWalletBalance, DisplayCurrency),
    walletAmount: toWalletBalance,
  })

  let amountFieldError: string | undefined = undefined

  if (
    lessThan({
      value: fromWalletBalance,
      lessThan: settlementSendAmount,
    })
  ) {
    amountFieldError = LL.SendBitcoinScreen.amountExceed({
      balance: fromWalletBalanceFormatted,
    })
  }

  const setAmountToBalancePercentage = (percentage: number) => {
    setMoneyAmount(
      toWalletAmount({
        amount: Math.round((fromWallet.balance * percentage) / 100),
        currency: fromWallet.walletCurrency,
      }),
    )
  }

  const moveToNextScreen = () => {
    navigation.navigate("conversionConfirmation", {
      fromWalletCurrency: fromWallet.walletCurrency,
      moneyAmount,
    })
  }

  return (
    <Screen preset="fixed" backgroundColor={styles.background.color}>
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.walletSelectorContainer}>
          <View style={styles.walletsContainer}>
            <View style={styles.fromFieldContainer}>
              <View style={styles.walletSelectorInfoContainer}>
                <View style={styles.walletSelectorTypeTextContainer}>
                  {fromWallet.walletCurrency === WalletCurrency.Btc ? (
                    <Text
                      style={styles.walletCurrencyText}
                    >{`${LL.common.from()} ${LL.common.btcAccount()}`}</Text>
                  ) : (
                    <Text
                      style={styles.walletCurrencyText}
                    >{`${LL.common.from()} ${LL.common.usdAccount()}`}</Text>
                  )}
                </View>
                <View style={styles.walletSelectorBalanceContainer}>
                  <Text style={styles.walletBalanceText}>
                    {fromWalletBalanceFormatted}
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
                <SwitchButton />
              </TouchableOpacity>
            </View>
            <View style={styles.toFieldContainer}>
              <View style={styles.walletSelectorInfoContainer}>
                <View style={styles.walletSelectorTypeTextContainer}>
                  {toWallet.walletCurrency === WalletCurrency.Btc ? (
                    <Text
                      style={styles.walletCurrencyText}
                    >{`${LL.common.to()} ${LL.common.btcAccount()}`}</Text>
                  ) : (
                    <Text
                      style={styles.walletCurrencyText}
                    >{`${LL.common.to()} ${LL.common.usdAccount()}`}</Text>
                  )}
                </View>
                <View style={styles.walletSelectorBalanceContainer}>
                  <Text style={styles.walletBalanceText}>{toWalletBalanceFormatted}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <AmountInput
            unitOfAccountAmount={moneyAmount}
            walletCurrency={fromWallet.walletCurrency}
            setAmount={setMoneyAmount}
            convertMoneyAmount={convertMoneyAmount}
          />
          {amountFieldError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{amountFieldError}</Text>
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
      <Button
        {...testProps(LL.common.next())}
        title={LL.common.next()}
        containerStyle={styles.buttonContainer}
        buttonStyle={[styles.button, styles.activeButtonStyle]}
        titleStyle={styles.activeButtonTitleStyle}
        disabledStyle={[styles.button, styles.disabledButtonStyle]}
        disabledTitleStyle={styles.disabledButtonTitleStyle}
        disabled={!isValidAmount}
        onPress={moveToNextScreen}
      />
    </Screen>
  )
}

const useStyles = makeStyles((theme) => ({
  scrollViewContainer: {
    flex: 1,
    flexDirection: "column",
    margin: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  amountFieldContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.whiteOrDarkGrey,
    borderRadius: 10,
  },
  toFieldContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginRight: 75,
  },
  switchButtonContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 15,
  },
  switchCurrencyIconContainer: {
    width: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  walletSelectorContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.whiteOrDarkGrey,
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
    backgroundColor: theme.colors.grey10OrWhite,
    height: 1,
    flex: 1,
  },
  switchButton: {
    height: 50,
    width: 50,
    borderRadius: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    backgroundColor: theme.colors.grey10OrWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  fromFieldContainer: {
    flexDirection: "row",
    marginBottom: 15,
    marginRight: 75,
  },
  fieldLabelContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  amountFieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.lapisLazuliOrLightGrey,
    padding: 10,
    width: 80,
  },
  percentageFieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.lapisLazuliOrLightGrey,
    padding: 10,
  },
  walletSelectorTypeContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: 50,
    marginRight: 20,
  },
  walletSelectorTypeLabelBitcoin: {
    height: 30,
    width: 50,
    borderRadius: 10,
    backgroundColor: palette.btcSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsd: {
    height: 30,
    width: 50,
    backgroundColor: palette.usdSecondary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSelectorTypeLabelUsdText: {
    fontWeight: "bold",
    color: palette.usdPrimary,
  },
  walletSelectorTypeLabelBtcText: {
    fontWeight: "bold",
    color: palette.btcPrimary,
  },
  walletSelectorInfoContainer: {
    flex: 1,
    flexDirection: "column",
  },
  walletCurrencyText: {
    fontWeight: "bold",
    fontSize: 18,
    color: theme.colors.lapisLazuliOrLightGrey,
  },
  walletSelectorTypeTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletSelectorBalanceContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  walletBalanceText: {
    color: theme.colors.grey0,
  },
  walletBalanceInput: {
    color: theme.colors.lapisLazuliOrLightGrey,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
    marginLeft: 20,
  },
  currencyInputContainer: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    height: 70,
  },
  percentageFieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    flexWrap: "wrap",
  },
  percentageField: {
    backgroundColor: palette.white,
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
  buttonContainer: { marginHorizontal: 20 },
  button: {
    height: 60,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: palette.lightBlue,
    color: palette.white,
    fontWeight: "bold",
  },
  disabledButtonStyle: {
    backgroundColor: theme.colors.grey4,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  errorContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
  },
  background: {
    color: theme.colors.lighterGreyOrBlack,
  },
}))
