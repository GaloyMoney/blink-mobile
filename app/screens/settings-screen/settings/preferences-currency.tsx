import { SettingsRow } from "../row"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const CurrencySetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { displayCurrency } = useDisplayCurrency()

  return (
    <SettingsRow
      title={LL.common.currency()}
      subtitle={displayCurrency}
      leftIcon="cash-outline"
      action={() => navigate("currency")}
    />
  )
}
