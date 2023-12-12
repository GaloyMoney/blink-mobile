import { SettingsRow } from "../row"

import { useI18nContext } from "@app/i18n/i18n-react"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import KeyStoreWrapper from "@app/utils/storage/secureStorage"

export const SecuritySetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const securityAction = async () => {
    const isBiometricsEnabled = await KeyStoreWrapper.getIsBiometricsEnabled()
    const isPinEnabled = await KeyStoreWrapper.getIsPinEnabled()

    navigate("security", {
      mIsBiometricsEnabled: isBiometricsEnabled,
      mIsPinEnabled: isPinEnabled,
    })
  }

  return (
    <SettingsRow
      title={LL.common.security()}
      leftIcon="shield-half-outline"
      action={securityAction}
    />
  )
}
