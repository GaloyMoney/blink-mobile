import * as React from "react"
import { WalletCurrency } from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  DisplayCurrency,
  isNonZeroMoneyAmount,
  MoneyAmount,
  WalletOrDisplayCurrency,
  ZeroDisplayAmount,
} from "@app/types/amounts"
import { makeStyles } from "@rneui/themed"
import { SafeAreaView } from "react-native"
import ReactNativeModal from "react-native-modal"
import { AmountInputScreen } from "../amount-input-screen"
import { MoneyAmountInputButton } from "./money-amount-input-button"
import { testProps } from "@app/utils/testProps"

export type MoneyAmountInputModalProps = {
  moneyAmount?: MoneyAmount<WalletOrDisplayCurrency>
  walletCurrency: WalletCurrency
  convertMoneyAmount: ConvertMoneyAmount
  setAmount?: (moneyAmount: MoneyAmount<WalletOrDisplayCurrency>) => void
  maxAmount?: MoneyAmount<WalletOrDisplayCurrency>
  minAmount?: MoneyAmount<WalletOrDisplayCurrency>
  canSetAmount?: boolean
}

export const MoneyAmountInputModal: React.FC<MoneyAmountInputModalProps> = ({
  moneyAmount,
  walletCurrency,
  setAmount,
  maxAmount,
  minAmount,
  convertMoneyAmount,
  canSetAmount = true,
}) => {
  const [isSettingAmount, setIsSettingAmount] = React.useState(false)
  const { formatMoneyAmount, getSecondaryAmountIfCurrencyIsDifferent } =
    useDisplayCurrency()
  const styles = useStyles()
  const { LL } = useI18nContext()

  const onSetAmount = (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
    setAmount && setAmount(amount)
    setIsSettingAmount(false)
  }

  if (isSettingAmount) {
    return (
      <ReactNativeModal
        isVisible={isSettingAmount}
        coverScreen={true}
        style={styles.modal}
        animationIn={"slideInLeft"}
        animationInTiming={300}
      >
        <SafeAreaView style={styles.amountInputScreenContainer}>
          <AmountInputScreen
            initialAmount={moneyAmount || ZeroDisplayAmount}
            convertMoneyAmount={convertMoneyAmount}
            walletCurrency={walletCurrency}
            setAmount={onSetAmount}
            maxAmount={maxAmount}
            minAmount={minAmount}
            goBack={() => setIsSettingAmount(false)}
          />
        </SafeAreaView>
      </ReactNativeModal>
    )
  }

  let formattedPrimaryAmount = undefined
  let formattedSecondaryAmount = undefined

  if (isNonZeroMoneyAmount(moneyAmount)) {
    formattedPrimaryAmount = formatMoneyAmount({ moneyAmount })
    const secondaryAmount = getSecondaryAmountIfCurrencyIsDifferent({
      primaryAmount: moneyAmount,
      walletAmount: convertMoneyAmount(moneyAmount, walletCurrency),
      displayAmount: convertMoneyAmount(moneyAmount, DisplayCurrency),
    })
    formattedSecondaryAmount =
      secondaryAmount && formatMoneyAmount({ moneyAmount: secondaryAmount })
  }

  const onPressInputButton = () => {
    setIsSettingAmount(true)
  }

  if (canSetAmount) {
    return (
      <MoneyAmountInputButton
        placeholder={LL.AmountInputButton.tapToSetAmount()}
        onPress={onPressInputButton}
        value={formattedPrimaryAmount}
        iconName="pencil"
        secondaryValue={formattedSecondaryAmount}
        primaryTextTestProps={"Money Amount Input Button Amount"}
        {...testProps("Money Amount Input Button")}
      />
    )
  }
  return (
    <MoneyAmountInputButton
      value={formattedPrimaryAmount}
      secondaryValue={formattedSecondaryAmount}
      disabled={true}
      primaryTextTestProps={"Money Amount Input Button Amount"}
      {...testProps("Money Amount Input Button")}
    />
  )
}

const useStyles = makeStyles((theme) => ({
  amountInputScreenContainer: {
    flex: 1,
  },
  modal: {
    backgroundColor: theme.colors.white,
    margin: 0,
  },
}))
