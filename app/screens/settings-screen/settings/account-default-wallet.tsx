import { useSettingsScreenQuery } from "@app/graphql/generated"
import { getBtcWallet } from "@app/graphql/wallets-utils"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { SettingsRow } from "../row"

export const DefaultWallet: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data, loading } = useSettingsScreenQuery()
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
