import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"

// components
import { SettingsRow } from "../row"

export const TxLimits: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  return (
    <SettingsRow
      shorter
      title={LL.common.transactionLimits()}
      leftIcon="information-circle-outline"
      action={() => navigate("transactionLimitsScreen")}
    />
  )
}
