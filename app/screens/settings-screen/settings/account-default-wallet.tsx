import { SettingsRow } from "../row"

import { useI18nContext } from "@app/i18n/i18n-react"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

import { getBtcWallet } from "@app/graphql/wallets-utils"
import { useSettingsContext } from "../settings-context"

export const DefaultWallet: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data, loading } = useSettingsContext()
  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)

  const btcWalletId = btcWallet?.id
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId
  const defaultWalletCurrency = defaultWalletId === btcWalletId ? "BTC" : "Stablesats USD"

  return (
    <SettingsRow
      loading={loading}
      title={LL.SettingsScreen.defaultWallet()}
      subtitle={defaultWalletCurrency}
      leftIcon="wallet-outline"
      action={() => {
        navigate("defaultWallet")
      }}
    />
  )
}
