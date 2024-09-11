import React, { useState } from "react"
import { ScrollView } from "react-native-gesture-handler"
import { makeStyles } from "@rneui/themed"
import { StackScreenProps } from "@react-navigation/stack"
import { useI18nContext } from "@app/i18n/i18n-react"

// components
import { Screen } from "@app/components/screen"
import {
  ConversionAmountError,
  PercentageAmount,
  SwapWallets,
} from "@app/components/swap-flow"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

// hooks
import { useBreez, usePriceConversion, useDisplayCurrency } from "@app/hooks"

// types & utils
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import {
  DisplayCurrency,
  MoneyAmount,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
  toWalletAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"

// gql
import {
  useConversionScreenQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { getUsdWallet } from "@app/graphql/wallets-utils"

type Props = StackScreenProps<RootStackParamList, "conversionDetails">

export const ConversionDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { zeroDisplayAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()
  const { formatDisplayAndWalletAmount } = useDisplayCurrency()
  const { btcWallet } = useBreez()

  const [hasError, setHasError] = useState(false)
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
        <SwapWallets
          fromWalletCurrency={fromWalletCurrency}
          formattedBtcBalance={formattedBtcBalance}
          formattedUsdBalance={formattedUsdBalance}
          canToggleWallet={canToggleWallet}
          setFromWalletCurrency={setFromWalletCurrency}
        />
        <ConversionAmountError
          fromWalletCurrency={fromWalletCurrency}
          formattedBtcBalance={formattedBtcBalance}
          formattedUsdBalance={formattedUsdBalance}
          btcBalance={btcBalance}
          usdBalance={usdBalance}
          settlementSendAmount={settlementSendAmount}
          moneyAmount={moneyAmount}
          setMoneyAmount={setMoneyAmount}
          setHasError={setHasError}
        />
        <PercentageAmount
          fromWalletCurrency={fromWalletCurrency}
          setAmountToBalancePercentage={setAmountToBalancePercentage}
        />
      </ScrollView>
      <GaloyPrimaryButton
        title={LL.common.next()}
        containerStyle={styles.buttonContainer}
        disabled={!isValidAmount || hasError}
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
  buttonContainer: { marginHorizontal: 20, marginBottom: 20 },
}))
