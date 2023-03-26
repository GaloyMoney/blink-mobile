import React, { useEffect } from "react"
import { Platform, Text, View } from "react-native"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler"

import { gql } from "@apollo/client"
import SwitchButton from "@app/assets/icons/transfer.svg"
import { MoneyAmountInput } from "@app/components/money-amount-input"
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
import { color, palette } from "@app/theme"
import {
  DisplayCurrency,
  lessThan,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
} from "@app/types/amounts"
import { testProps } from "@app/utils/testProps"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Button } from "@rneui/base"
import { makeStyles } from "@rneui/themed"

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
  const { formatDisplayAndWalletAmount, getSecondaryAmountIfCurrencyIsDifferent } =
    useDisplayCurrency()

  const btcWallet = data?.me?.defaultAccount.btcWallet
  const usdWallet = data?.me?.defaultAccount.usdWallet

  const {
    fromWallet,
    toWallet,
    setWallets,
    settlementSendAmount,
    displayAmount,
    setMoneyAmount,
    convertMoneyAmount,
    isValidAmount,
    moneyAmount,
    toggleAmountCurrency,
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
    setMoneyAmount({
      amount: Math.round((fromWallet.balance * percentage) / 100),
      currency: fromWallet.walletCurrency,
    })
  }

  const moveToNextScreen = () => {
    navigation.navigate("conversionConfirmation", {
      fromWalletCurrency: fromWallet.walletCurrency,
      moneyAmount,
    })
  }

  const secondaryAmount = getSecondaryAmountIfCurrencyIsDifferent({
    walletAmount: settlementSendAmount,
    displayAmount,
    primaryAmount: moneyAmount,
  })

  return (
    <Screen preset="fixed">
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.fieldContainer}>
          <View style={styles.fromFieldContainer}>
            <View style={styles.walletSelectorTypeContainer}>
              <View
                style={
                  fromWallet.walletCurrency === WalletCurrency.Btc
                    ? styles.walletSelectorTypeLabelBitcoin
                    : styles.walletSelectorTypeLabelUsd
                }
              >
                {fromWallet.walletCurrency === WalletCurrency.Btc ? (
                  <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                ) : (
                  <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
                )}
              </View>
            </View>
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
                <Text style={styles.walletBalanceText}>{fromWalletBalanceFormatted}</Text>
              </View>
            </View>
          </View>
          {canToggleWallet ? (
            <View style={styles.switchButtonContainer}>
              <TouchableWithoutFeedback
                style={styles.switchButton}
                onPress={toggleWallet}
              >
                <SwitchButton />
              </TouchableWithoutFeedback>
            </View>
          ) : null}

          <View style={styles.toFieldContainer}>
            <View style={styles.walletSelectorTypeContainer}>
              <View
                style={
                  toWallet.walletCurrency === WalletCurrency.Btc
                    ? styles.walletSelectorTypeLabelBitcoin
                    : styles.walletSelectorTypeLabelUsd
                }
              >
                {toWallet.walletCurrency === WalletCurrency.Btc ? (
                  <Text style={styles.walletSelectorTypeLabelBtcText}>BTC</Text>
                ) : (
                  <Text style={styles.walletSelectorTypeLabelUsdText}>USD</Text>
                )}
              </View>
            </View>
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
        <View style={styles.fieldContainer}>
          <View style={styles.amountFieldContainer}>
            <View style={styles.fieldLabelContainer}>
              <Text style={styles.amountFieldLabel}>{LL.SendBitcoinScreen.amount()}</Text>
            </View>
            <View style={styles.currencyInputContainer}>
              <MoneyAmountInput
                {...testProps(`${moneyAmount.currency} Input`)}
                moneyAmount={moneyAmount}
                setAmount={setMoneyAmount}
                editable={true}
                style={styles.walletBalanceInput}
              />
              {secondaryAmount && (
                <MoneyAmountInput
                  moneyAmount={secondaryAmount}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              )}
            </View>
            {secondaryAmount && (
              <View
                {...testProps("switch-button")}
                style={styles.switchCurrencyIconContainer}
              >
                <TouchableWithoutFeedback
                  style={styles.switchButton}
                  onPress={toggleAmountCurrency}
                >
                  <View>
                    <SwitchButton />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            )}
          </View>
          {amountFieldError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{amountFieldError}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldContainer}>
          <View style={styles.percentageContainer}>
            <View style={styles.percentageLabelContainer}>
              <Text style={styles.percentageFieldLabel}>
                {LL.TransferScreen.percentageToConvert()}
              </Text>
            </View>
            <View style={styles.percentageFieldContainer}>
              <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(25)}>
                <View style={styles.percentageField}>
                  <Text>25%</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(50)}>
                <View style={styles.percentageField}>
                  <Text>50%</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(75)}>
                <View style={styles.percentageField}>
                  <Text>75%</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => setAmountToBalancePercentage(100)}>
                <View style={styles.percentageField}>
                  <Text>100%</Text>
                </View>
              </TouchableWithoutFeedback>
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
    backgroundColor: theme.colors.whiteOrDarkGrey,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 15,
  },
  switchButtonContainer: {
    height: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 30,
  },
  switchCurrencyIconContainer: {
    width: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  switchButton: {
    height: 50,
    width: 50,
    borderRadius: 50,
    zIndex: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    backgroundColor: theme.colors.grey9OrWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fromFieldContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.whiteOrDarkGrey,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    padding: 15,
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
    width: 100,
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
  },
  walletBalanceText: {
    color: theme.colors.grey1,
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
    justifyContent: "flex-end",
    flex: 4,
  },
  percentageField: {
    backgroundColor: palette.white,
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
    flex: 1,
    margin: 4,
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
    backgroundColor: theme.colors.grey9,
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
    color: color.error,
  },
}))
