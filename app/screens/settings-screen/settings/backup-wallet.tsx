import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { SettingsRow } from "../row"

export const BackupWallet: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  return (
    <SettingsRow
      title={LL.SettingsScreen.backup()}
      leftIcon="apps-outline"
      action={() => navigate("BackupOptions")}
    />
  )
}
