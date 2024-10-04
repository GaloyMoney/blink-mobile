import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { makeStyles } from "@rneui/themed"

// components
import { DetailDescription, InforError } from "@app/components/redeem-flow"
import { AmountInput } from "@app/components/amount-input"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { Screen } from "@app/components/screen"

// hooks
import { usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { usePersistentStateContext } from "@app/store/persistent-state"

// types
import { WalletCurrency } from "@app/graphql/generated"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import {
  DisplayCurrency,
  MoneyAmount,
  toBtcMoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"

type Prop = StackScreenProps<RootStackParamList, "redeemBitcoinDetail">

const RedeemBitcoinDetailScreen: React.FC<Prop> = ({ route, navigation }) => {
  const {
    callback,
    domain,
    defaultDescription,
    k1,
    minWithdrawable,
    maxWithdrawable,
    lnurl,
  } = route.params.receiveDestination.validDestination
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { persistentState } = usePersistentStateContext()
  const { convertMoneyAmount } = usePriceConversion()

  const [hasError, setHasError] = useState(false)

  const minWithdrawableSatoshis = toBtcMoneyAmount(Math.round(minWithdrawable / 1000))
  const maxWithdrawableSatoshis = toBtcMoneyAmount(Math.round(maxWithdrawable / 1000))

  const [unitOfAccountAmount, setUnitOfAccountAmount] = useState<
    MoneyAmount<WalletOrDisplayCurrency>
  >(minWithdrawableSatoshis)

  if (!convertMoneyAmount) {
    console.log("convertMoneyAmount is undefined")
    return null
  }

  const amountIsFlexible =
    minWithdrawableSatoshis.amount !== maxWithdrawableSatoshis.amount

  const btcMoneyAmount = convertMoneyAmount(unitOfAccountAmount, WalletCurrency.Btc)

  const validAmount =
    btcMoneyAmount.amount !== null &&
    btcMoneyAmount.amount <= maxWithdrawableSatoshis.amount &&
    btcMoneyAmount.amount >= minWithdrawableSatoshis.amount

  useEffect(() => {
    if (persistentState.defaultWallet?.walletCurrency === WalletCurrency.Usd) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.usdTitle() })
    } else if (persistentState.defaultWallet?.walletCurrency === WalletCurrency.Btc) {
      navigation.setOptions({ title: LL.RedeemBitcoinScreen.title() })
    }
  }, [persistentState.defaultWallet])

  const navigate = () => {
    if (persistentState.defaultWallet) {
      navigation.replace("redeemBitcoinResult", {
        callback,
        domain,
        k1,
        defaultDescription,
        minWithdrawableSatoshis,
        maxWithdrawableSatoshis,
        receivingWalletDescriptor: {
          id: persistentState.defaultWallet?.id,
          currency: persistentState.defaultWallet?.walletCurrency,
        },
        unitOfAccountAmount,
        settlementAmount: btcMoneyAmount,
        displayAmount: convertMoneyAmount(btcMoneyAmount, DisplayCurrency),
        usdAmount: convertMoneyAmount(btcMoneyAmount, WalletCurrency.Usd),
        lnurl,
      })
    }
  }

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
      <DetailDescription defaultDescription={defaultDescription} domain={domain} />
      <View style={styles.currencyInputContainer}>
        <AmountInput
          walletCurrency={persistentState.defaultWallet?.walletCurrency || "BTC"}
          unitOfAccountAmount={unitOfAccountAmount}
          setAmount={setUnitOfAccountAmount}
          maxAmount={maxWithdrawableSatoshis}
          minAmount={minWithdrawableSatoshis}
          convertMoneyAmount={convertMoneyAmount}
          canSetAmount={amountIsFlexible}
        />
        <InforError
          unitOfAccountAmount={unitOfAccountAmount}
          minWithdrawableSatoshis={minWithdrawableSatoshis}
          maxWithdrawableSatoshis={maxWithdrawableSatoshis}
          amountIsFlexible={amountIsFlexible}
          setHasError={setHasError}
        />
      </View>

      <GaloyPrimaryButton
        title={LL.RedeemBitcoinScreen.redeemBitcoin()}
        disabled={!validAmount || hasError}
        onPress={navigate}
      />
    </Screen>
  )
}

export default RedeemBitcoinDetailScreen

const useStyles = makeStyles(({ colors }) => ({
  currencyInputContainer: {
    paddingVertical: 20,
    borderRadius: 10,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
}))
