import SwitchIcon from "@app/assets/icons/switch.svg"
import { MoneyAmountInput } from "@app/components/money-amount-input"
import { Screen } from "@app/components/screen"
import { useReceiveBtcQuery, WalletCurrency } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { palette } from "@app/theme"
import {
  BtcMoneyAmount,
  DisplayCurrency,
  MoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { testProps } from "@app/utils/testProps"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Button, Text } from "@rneui/base"
import { makeStyles } from "@rneui/themed"
import React, { useEffect, useState } from "react"
import { Pressable, View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"

const useStyles = makeStyles((theme) => ({
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    marginTop: 14,
  },
  usdActive: {
    backgroundColor: palette.usdSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  btcActive: {
    backgroundColor: palette.btcSecondary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  activeTabText: {
    color: palette.darkGrey,
  },
  inactiveTab: {
    backgroundColor: theme.colors.white,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  inactiveTabText: {
    color: palette.coolGrey,
  },

  container: {
    marginTop: 14,
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
    fontSize: 14,
  },
  withdrawalErrorText: {
    color: palette.red,
    fontSize: 14,
  },
  withdrawableDescriptionText: {
    color: theme.colors.grey0,
    fontSize: 16,
    textAlign: "center",
  },
  withdrawableAmountToRedeemText: {
    color: theme.colors.grey0,
    fontSize: 16,
    textAlign: "center",
  },
  walletBalanceInput: {
    color: palette.lapisLazuli,
    fontSize: 20,
    fontWeight: "600",
  },
  convertedAmountText: {
    color: palette.coolGrey,
    fontSize: 14,
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
  contentContainer: {
    backgroundColor: theme.colors.white,
    padding: 20,
    flexGrow: 1,
  },
}))

type Prop = {
  route: RouteProp<RootStackParamList, "redeemBitcoinDetail">
}

const RedeemBitcoinDetailScreen: React.FC<Prop> = ({ route }) => {
  const styles = useStyles()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "redeemBitcoinDetail">>()

  const { formatMoneyAmount, displayCurrency } = useDisplayCurrency()

  const { callback, domain, defaultDescription, k1, minWithdrawable, maxWithdrawable } =
    route.params.receiveDestination.validDestination

  // minWithdrawable and maxWithdrawable are in msats
  const minWithdrawableSatoshis: BtcMoneyAmount = {
    amount: Math.round(minWithdrawable / 1000),
    currency: WalletCurrency.Btc,
  }
  const maxWithdrawableSatoshis: BtcMoneyAmount = {
    amount: Math.round(maxWithdrawable / 1000),
    currency: WalletCurrency.Btc,
  }
  const amountIsFlexible =
    minWithdrawableSatoshis.amount !== maxWithdrawableSatoshis.amount

  const [receiveCurrency, setReceiveCurrency] = useState<WalletCurrency>(
    WalletCurrency.Btc,
  )

  const { LL } = useI18nContext()
  const { data } = useReceiveBtcQuery({ fetchPolicy: "cache-first" })
  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id

  const usdWalletId = null // TODO: enable receiving USD when USD invoices support satoshi amounts

  useEffect(() => {
    if (receiveCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    }

    if (receiveCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [receiveCurrency, navigation, LL])

  const [unitOfAccountAmount, setUnitOfAccountAmount] = useState<
    MoneyAmount<WalletOrDisplayCurrency>
  >(minWithdrawableSatoshis)
  const { convertMoneyAmount } = usePriceConversion()

  if (!convertMoneyAmount) {
    console.log("convertMoneyAmount is undefined")
    return null
  }

  const btcMoneyAmount = convertMoneyAmount(unitOfAccountAmount, WalletCurrency.Btc)

  const validAmount =
    btcMoneyAmount.amount !== null &&
    btcMoneyAmount.amount <= maxWithdrawableSatoshis.amount &&
    btcMoneyAmount.amount >= minWithdrawableSatoshis.amount

  const minUnitOfAccountAmount = convertMoneyAmount(
    minWithdrawableSatoshis,
    unitOfAccountAmount.currency,
  )
  const maxUnitOfAccountAmount = convertMoneyAmount(
    maxWithdrawableSatoshis,
    unitOfAccountAmount.currency,
  )
  const secondaryCurrency =
    unitOfAccountAmount.currency === receiveCurrency ? DisplayCurrency : receiveCurrency
  const secondaryAmount =
    displayCurrency === receiveCurrency
      ? undefined
      : convertMoneyAmount(unitOfAccountAmount, secondaryCurrency)

  const toggleAmountCurrency = () => {
    setUnitOfAccountAmount(convertMoneyAmount(unitOfAccountAmount, secondaryCurrency))
  }

  const navigate = () => {
    if (receiveCurrency !== WalletCurrency.Btc) {
      return
    }

    btcWalletId &&
      navigation.replace("redeemBitcoinResult", {
        callback,
        domain,
        k1,
        defaultDescription,
        minWithdrawableSatoshis,
        maxWithdrawableSatoshis,
        receivingWalletDescriptor: {
          id: btcWalletId,
          currency: receiveCurrency,
        },
        unitOfAccountAmount,
        settlementAmount: btcMoneyAmount,
        secondaryAmount,
      })
  }

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
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
        <Text style={styles.withdrawableAmountToRedeemText}>
          {LL.RedeemBitcoinScreen.amountToRedeemFrom({ domain })}
        </Text>
        <View style={styles.currencyInputContainer}>
          <View style={styles.currencyInput}>
            <MoneyAmountInput
              moneyAmount={unitOfAccountAmount}
              setAmount={(amount) => {
                setUnitOfAccountAmount(amount)
              }}
              style={styles.walletBalanceInput}
              editable={amountIsFlexible}
            />
            {amountIsFlexible && (
              <Text
                style={
                  unitOfAccountAmount.amount <= maxUnitOfAccountAmount.amount &&
                  unitOfAccountAmount.amount >= minUnitOfAccountAmount.amount
                    ? styles.infoText
                    : styles.withdrawalErrorText
                }
              >
                {LL.RedeemBitcoinScreen.minMaxRange({
                  minimumAmount: formatMoneyAmount({
                    moneyAmount: minUnitOfAccountAmount,
                  }),
                  maximumAmount: formatMoneyAmount({
                    moneyAmount: maxUnitOfAccountAmount,
                  }),
                })}
              </Text>
            )}
            {secondaryAmount && (
              <MoneyAmountInput
                moneyAmount={secondaryAmount}
                style={styles.convertedAmountText}
                editable={false}
              />
            )}
          </View>
          {amountIsFlexible && (
            <View style={styles.toggle}>
              <Pressable onPress={toggleAmountCurrency}>
                <View style={styles.switchCurrencyIconContainer}>
                  <SwitchIcon />
                </View>
              </Pressable>
            </View>
          )}
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
    </Screen>
  )
}

export default RedeemBitcoinDetailScreen
