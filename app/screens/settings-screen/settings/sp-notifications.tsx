import { SettingsRow } from "../row"

import { useI18nContext } from "@app/i18n/i18n-react"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const NotificationSetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  return (
    <SettingsRow
      title={LL.common.notifications()}
      leftIcon="notifications-outline"
      action={() => navigate("notificationSettingsScreen")}
    />
  )
}
