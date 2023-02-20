import React, { useEffect, useState } from "react"
import { Pressable, View } from "react-native"
import { FakeCurrencyInput } from "react-native-currency-input"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"

import SwitchIcon from "@app/assets/icons/switch.svg"
import { useReceiveBtcQuery, WalletCurrency } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import { StackScreenProps } from "@react-navigation/stack"
import { Button, Text } from "@rneui/base"
import { testProps } from "@app/utils/testProps"

const styles = EStyleSheet.create({
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    marginTop: 12,
  },
  usdActive: {
    backgroundColor: palette.usdSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  btcActive: {
    backgroundColor: palette.btcSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  activeTabText: {
    color: palette.darkGrey,
  },
  inactiveTab: {
    backgroundColor: palette.white,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: "150rem",
    height: "30rem",
    margin: "5rem",
  },
  inactiveTabText: {
    color: palette.coolGrey,
  },

  container: {
    marginTop: "14rem",
    marginLeft: 20,
    marginRight: 20,
  },
  inputForm: {
    marginVertical: 20,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  infoText: {
    color: palette.midGrey,
    fontSize: "12rem",
  },
  withdrawalErrorText: {
    color: palette.red,
    fontSize: "12rem",
  },
  withdrawableDescriptionText: {
    color: palette.midGrey,
    fontSize: "14rem",
    textAlign: "center",
  },
  withdrawableAmountToRedeemText: {
    color: palette.midGrey,
    fontSize: "10rem",
    textAlign: "center",
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 12,
  },
  switchCurrencyIconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyInput: {
    flexDirection: "column",
    flex: 1,
  },
  toggle: {
    justifyContent: "flex-end",
  },
  button: {
    height: 60,
    borderRadius: 10,
    marginTop: 40,
  },
  activeButtonStyle: {
    backgroundColor: palette.lightBlue,
  },
  activeButtonTitleStyle: {
    color: palette.white,
    fontWeight: "bold",
  },
  disabledButtonStyle: {
    backgroundColor: palette.lighterGrey,
  },
  disabledButtonTitleStyle: {
    color: palette.lightBlue,
    fontWeight: "600",
  },
})
const RedeemBitcoinDetailScreen = ({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "redeemBitcoinDetail">) => {
  const { callback, domain, defaultDescription, k1, minWithdrawable, maxWithdrawable } =
    route.params.receiveDestination.validDestination
  const minWithdrawableSatoshis = minWithdrawable / 1000
  const maxWithdrawableSatoshis = maxWithdrawable / 1000

  const [receiveCurrency, setReceiveCurrency] = useState<WalletCurrency>(
    WalletCurrency.Btc,
  )
  const { LL } = useI18nContext()

  useEffect(() => {
    if (receiveCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  const [satAmount, setSatAmount] = useState(minWithdrawableSatoshis)
  const { convertCurrencyAmount } = usePriceConversion()
  const satAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const minSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const maxSatAmountInUsd = convertCurrencyAmount({
    amount: satAmount,
    from: "BTC",
    to: "USD",
  })
  const [usdAmount, setUsdAmount] = useState<number | null>(satAmountInUsd)

  const [amountCurrency, setAmountCurrency] = useState("BTC")

  const { data } = useReceiveBtcQuery({ fetchPolicy: "cache-first" })
  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id

  const usdWalletId = null // TODO: when usd wallet ln invoices can be generated providing the sats amount as in put we can have the usdWalletId from useMainQuery as follows: const { usdWalletId } = useMainQuery()

  const toggleAmountCurrency = () => {
    if (amountCurrency === "USD") {
      setAmountCurrency("BTC")
    }
    if (amountCurrency === "BTC") {
      setAmountCurrency("USD")
      setUsdAmount(
        convertCurrencyAmount({
          amount: satAmount,
          from: "BTC",
          to: "USD",
        }),
      )
    }
  }

  const updateUSDAmount = (usdAmount: number | null) => {
    setUsdAmount(usdAmount)

    setSatAmount(
      Math.min(
        minWithdrawableSatoshis,
        Math.max(
          maxWithdrawable,
          // UsdAmountInSats
          Math.round(
            convertCurrencyAmount({
              amount: usdAmount ?? 0,
              from: "USD",
              to: "BTC",
            }),
          ),
        ),
      ),
    )
  }

  const validAmount =
    (amountCurrency === "BTC" &&
      satAmount !== null &&
      satAmount <= maxWithdrawableSatoshis &&
      satAmount >= minWithdrawableSatoshis) ||
    (amountCurrency === "USD" &&
      usdAmount !== null &&
      satAmount <= maxWithdrawableSatoshis &&
      satAmount >= minWithdrawableSatoshis)

  const navigate = () => {
    const walletId = receiveCurrency === WalletCurrency.Usd ? usdWalletId : btcWalletId
    walletId &&
      navigation.replace("redeemBitcoinResult", {
        callback,
        domain,
        k1,
        defaultDescription,
        minWithdrawableSatoshis,
        maxWithdrawableSatoshis,
        receiveCurrency,
        walletId,
        satAmount,
        satAmountInUsd,
        amountCurrency,
      })
  }

  return (
    <View style={styles.container}>
      {usdWalletId && (
        <View style={styles.tabRow}>
          <TouchableWithoutFeedback
            onPress={() => setReceiveCurrency(WalletCurrency.Btc)}
          >
            <View
              style={
                receiveCurrency === WalletCurrency.Btc
                  ? styles.btcActive
                  : styles.inactiveTab
              }
            >
              <Text
                style={
                  receiveCurrency === WalletCurrency.Btc
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                BTC
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => setReceiveCurrency(WalletCurrency.Usd)}
          >
            <View
              style={
                receiveCurrency === WalletCurrency.Usd
                  ? styles.usdActive
                  : styles.inactiveTab
              }
            >
              <Text
                style={
                  receiveCurrency === WalletCurrency.Usd
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                USD
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
      <View style={[styles.inputForm, styles.container]}>
        {defaultDescription && (
          <Text {...testProps("description")} style={styles.withdrawableDescriptionText}>
            {defaultDescription}
          </Text>
        )}
        <Text style={[styles.withdrawableAmountToRedeemText, styles.padding]}>
          {LL.RedeemBitcoinScreen.amountToRedeemFrom({ domain })}
        </Text>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            {amountCurrency === "BTC" && (
              <>
                <FakeCurrencyInput
                  value={satAmount}
                  onChangeValue={(newValue) => setSatAmount(Number(newValue))}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={0}
                  suffix=" sats"
                  minValue={minWithdrawableSatoshis}
                  style={styles.walletBalanceInput}
                  editable={maxWithdrawable !== minWithdrawable}
                  autoFocus
                />
                {minWithdrawable !== maxWithdrawable && (
                  <Text
                    style={
                      satAmount <= maxWithdrawableSatoshis
                        ? styles.infoText
                        : styles.withdrawalErrorText
                    }
                  >
                    {LL.RedeemBitcoinScreen.minMaxRange({
                      minimumAmount: minWithdrawableSatoshis.toString(),
                      maximumAmount: maxWithdrawableSatoshis.toString(),
                      currencyTicker: "sats",
                    })}
                  </Text>
                )}
                <FakeCurrencyInput
                  value={satAmountInUsd}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
            {amountCurrency === "USD" && (
              <>
                <FakeCurrencyInput
                  value={usdAmount}
                  onChangeValue={(newValue) => {
                    updateUSDAmount(newValue)
                  }}
                  prefix="$"
                  delimiter=","
                  separator="."
                  precision={2}
                  style={styles.walletBalanceInput}
                  minValue={minSatAmountInUsd}
                  maxValue={maxSatAmountInUsd}
                  editable={maxWithdrawable !== minWithdrawable}
                  autoFocus
                />
                {maxWithdrawable !== minWithdrawable && (
                  <Text
                    style={
                      satAmount <= maxWithdrawableSatoshis
                        ? styles.infoText
                        : styles.withdrawalErrorText
                    }
                  >
                    {LL.RedeemBitcoinScreen.minMaxRange({
                      minimumAmount: minSatAmountInUsd.toFixed(2),
                      maximumAmount: maxSatAmountInUsd.toFixed(2),
                      currencyTicker: "USD",
                    })}
                  </Text>
                )}

                <FakeCurrencyInput
                  value={satAmount}
                  prefix=""
                  delimiter=","
                  separator="."
                  suffix=" sats"
                  precision={0}
                  minValue={0}
                  editable={false}
                  style={styles.convertedAmountText}
                />
              </>
            )}
          </View>

          <View style={styles.toggle}>
            <Pressable onPress={toggleAmountCurrency}>
              <View style={styles.switchCurrencyIconContainer}>
                <SwitchIcon />
              </View>
            </Pressable>
          </View>
        </View>

        <Button
          {...testProps(LL.RedeemBitcoinScreen.redeemBitcoin())}
          title={LL.RedeemBitcoinScreen.redeemBitcoin()}
          buttonStyle={[styles.button, styles.activeButtonStyle]}
          titleStyle={styles.activeButtonTitleStyle}
          disabledStyle={[styles.button, styles.disabledButtonStyle]}
          disabledTitleStyle={styles.disabledButtonTitleStyle}
          disabled={!validAmount}
          onPress={navigate}
        />
      </View>
    </View>
  )
}

export default RedeemBitcoinDetailScreen
