import { AmountInput } from "@app/components/amount-input"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { Screen } from "@app/components/screen"
import { WalletCurrency } from "@app/graphql/generated"
import { usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { usePersistentStateContext } from "@app/store/persistent-state"
import {
  DisplayCurrency,
  MoneyAmount,
  toBtcMoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"
import { testProps } from "@app/utils/testProps"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text } from "@rneui/themed"
import React, { useEffect, useState } from "react"
import { View } from "react-native"

type Prop = {
  route: RouteProp<RootStackParamList, "redeemBitcoinDetail">
}

const RedeemBitcoinDetailScreen: React.FC<Prop> = ({ route }) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { persistentState } = usePersistentStateContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "redeemBitcoinDetail">>()

  const { formatMoneyAmount } = useDisplayCurrency()

  const {
    callback,
    domain,
    defaultDescription,
    k1,
    minWithdrawable,
    maxWithdrawable,
    lnurl,
  } = route.params.receiveDestination.validDestination

  // minWithdrawable and maxWithdrawable are in msats
  const minWithdrawableSatoshis = toBtcMoneyAmount(Math.round(minWithdrawable / 1000))
  const maxWithdrawableSatoshis = toBtcMoneyAmount(Math.round(maxWithdrawable / 1000))

  const amountIsFlexible =
    minWithdrawableSatoshis.amount !== maxWithdrawableSatoshis.amount

  const defaultWallet = persistentState.defaultWallet

  useEffect(() => {
    if (defaultWallet?.walletCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    } else if (defaultWallet?.walletCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [defaultWallet, navigation, LL])

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

  const navigate = () => {
    if (defaultWallet) {
      navigation.replace("redeemBitcoinResult", {
        callback,
        domain,
        k1,
        defaultDescription,
        minWithdrawableSatoshis,
        maxWithdrawableSatoshis,
        receivingWalletDescriptor: {
          id: defaultWallet?.id,
          currency: defaultWallet?.walletCurrency,
        },
        unitOfAccountAmount,
        settlementAmount: btcMoneyAmount,
        displayAmount: convertMoneyAmount(btcMoneyAmount, DisplayCurrency),
        lnurl,
      })
    }
  }

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
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
          <AmountInput
            walletCurrency={defaultWallet?.walletCurrency || "BTC"}
            unitOfAccountAmount={unitOfAccountAmount}
            setAmount={setUnitOfAccountAmount}
            maxAmount={maxWithdrawableSatoshis}
            minAmount={minWithdrawableSatoshis}
            convertMoneyAmount={convertMoneyAmount}
            canSetAmount={amountIsFlexible}
          />
          {amountIsFlexible && (
            <Text
              style={
                unitOfAccountAmount.amount <= maxWithdrawableSatoshis.amount &&
                unitOfAccountAmount.amount >= minWithdrawableSatoshis.amount
                  ? styles.infoText
                  : styles.withdrawalErrorText
              }
            >
              {LL.RedeemBitcoinScreen.minMaxRange({
                minimumAmount: formatMoneyAmount({
                  moneyAmount: minWithdrawableSatoshis,
                }),
                maximumAmount: formatMoneyAmount({
                  moneyAmount: maxWithdrawableSatoshis,
                }),
              })}
            </Text>
          )}
        </View>

        <GaloyPrimaryButton
          title={LL.RedeemBitcoinScreen.redeemBitcoin()}
          disabled={!validAmount}
          onPress={navigate}
        />
      </View>
    </Screen>
  )
}

export default RedeemBitcoinDetailScreen

const useStyles = makeStyles(({ colors }) => ({
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    marginTop: 14,
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
    padding: 20,
    borderRadius: 10,
  },
  infoText: {
    color: colors.grey2,
    fontSize: 14,
  },
  withdrawalErrorText: {
    color: colors.error,
    fontSize: 14,
  },
  withdrawableDescriptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  withdrawableAmountToRedeemText: {
    fontSize: 16,
    textAlign: "center",
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
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
}))
