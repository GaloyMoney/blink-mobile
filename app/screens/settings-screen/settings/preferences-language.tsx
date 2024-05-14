import { useSettingsScreenQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { LocaleToTranslateLanguageSelector } from "@app/i18n/mapping"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { getLanguageFromString } from "@app/utils/locale-detector"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { SettingsRow } from "../row"

export const LanguageSetting: React.FC = () => {
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data, loading } = useSettingsScreenQuery()
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
