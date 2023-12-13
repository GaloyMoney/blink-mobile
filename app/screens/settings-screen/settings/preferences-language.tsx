import { SettingsRow } from "../row"

import { useI18nContext } from "@app/i18n/i18n-react"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

import { useSettingsContext } from "../settings-context"

import { getLanguageFromString } from "@app/utils/locale-detector"
import { LocaleToTranslateLanguageSelector } from "@app/i18n/mapping"

export const LanguageSetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data, loading } = useSettingsContext()
  const language = getLanguageFromString(data?.me?.language)

  return (
    <SettingsRow
      loading={loading}
      title={LL.common.language()}
      subtitle={
        language === "DEFAULT"
          ? LL.SettingsScreen.setByOs()
          : LocaleToTranslateLanguageSelector[language]
      }
      leftIcon="language"
      action={() => navigate("language")}
    />
  )
}
