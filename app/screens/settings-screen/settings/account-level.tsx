import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import { useLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"

// components
import { SettingsRow } from "../row"

export const AccountLevelSetting: React.FC = () => {
  const { currentLevel: level } = useLevel()
  const { LL } = useI18nContext()
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

  return (
    <SettingsRow
      title={LL.common.account()}
      subtitle={LL.AccountScreen.level({ level })}
      leftIcon="people"
      action={() => {
        navigate("accountScreen")
      }}
    />
  )
}
