import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"

import { SettingsRow } from "../../row"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const UpgradeAccountLevelOne: React.FC = () => {
  const { currentLevel } = useLevel()
  const { LL } = useI18nContext()

  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  if (currentLevel !== AccountLevel.One) return <></>

  return (
    <SettingsRow
      title={LL.AccountScreen.upgrade()}
      leftIcon="person-outline"
      action={() => navigate("fullOnboardingFlow")}
    />
  )
}
