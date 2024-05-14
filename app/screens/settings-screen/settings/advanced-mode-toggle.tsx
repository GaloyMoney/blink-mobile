import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { SettingsRow } from "../row"
import { useAppDispatch, useAppSelector } from "@app/store/redux"
import useBreezBalance from "@app/hooks/useBreezBalance"
import { toBtcMoneyAmount } from "@app/types/amounts"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { Alert } from "react-native"
import {
  useAccountUpdateDefaultWalletIdMutation,
  useSettingsScreenQuery,
} from "@app/graphql/generated"
import { getUsdWallet } from "@app/graphql/wallets-utils"
import { useLevel } from "@app/graphql/level-context"
import { updateSettings } from "@app/store/redux/slices/settingsSlice"
import { save } from "@app/utils/storage"

export const AdvancedModeToggle: React.FC = () => {
  const { LL } = useI18nContext()
  const { isAtLeastLevelZero } = useLevel()
  const { goBack } = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { isAdvanceMode } = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  const [breezBalance] = useBreezBalance()
  const { moneyAmountToDisplayCurrencyString } = useDisplayCurrency()

  const [accountUpdateDefaultWallet, { loading }] =
    useAccountUpdateDefaultWalletIdMutation()
  const { data } = useSettingsScreenQuery({
    fetchPolicy: "cache-first",
    returnPartialData: true,
    skip: !isAtLeastLevelZero,
  })

  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const handleSetDefaultWallet = async () => {
    if (loading) return
    if (usdWallet) {
      await accountUpdateDefaultWallet({
        variables: {
          input: {
            walletId: usdWallet?.id,
          },
        },
      })
    }
  }

  const toggleAdvanceModeComplete = (isAdvanceMode: boolean) => {
    if (!isAdvanceMode) {
      handleSetDefaultWallet()
    }
    dispatch(updateSettings({ isAdvanceMode }))
    save("isAdvanceMode", isAdvanceMode)
    setTimeout(() => goBack(), 500)
  }

  const toggleAdvanceMode = () => {
    if (isAdvanceMode) {
      if (breezBalance && breezBalance > 0) {
        const btcWalletBalance = toBtcMoneyAmount(breezBalance || 0)
        const convertedBalance =
          moneyAmountToDisplayCurrencyString({
            moneyAmount: btcWalletBalance,
            isApproximate: true,
          }) || "0"
        const btcBalanceWarning = LL.AccountScreen.btcBalanceWarning({
          balance: convertedBalance,
        })

        const fullMessage = btcBalanceWarning + "\n" + LL.support.switchToBeginnerMode()

        Alert.alert(LL.common.warning(), fullMessage, [
          { text: LL.common.cancel(), onPress: () => {} },
          {
            text: LL.common.yes(),
            onPress: () => toggleAdvanceModeComplete(false),
          },
        ])
      } else {
        toggleAdvanceModeComplete(false)
      }
    } else {
      toggleAdvanceModeComplete(true)
    }
  }

  return (
    <SettingsRow
      title={
        isAdvanceMode ? LL.SettingsScreen.beginnerMode() : LL.SettingsScreen.advanceMode()
      }
      leftIcon={isAdvanceMode ? "invert-mode-outline" : "invert-mode"}
      action={toggleAdvanceMode}
      rightIcon={"sync-outline"}
    />
  )
}
