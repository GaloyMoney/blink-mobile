import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { SettingsRow } from "../row"
import { usePersistentStateContext } from "@app/store/persistent-state"

export const DefaultWallet: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { persistentState } = usePersistentStateContext()

  const defaultWalletCurrency =
    persistentState.defaultWallet?.walletCurrency === "BTC" ? "BTC" : "Cash (USD)"

  if (persistentState.isAdvanceMode) {
    return (
      <SettingsRow
        title={LL.SettingsScreen.defaultWallet()}
        subtitle={defaultWalletCurrency}
        leftIcon="wallet-outline"
        action={() => {
          navigate("defaultWallet")
        }}
      />
    )
  } else {
    return null
  }
}
