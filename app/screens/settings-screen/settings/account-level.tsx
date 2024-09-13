import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import { useLevel, AccountLevel } from "@app/graphql/level-context"
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
      subtitle={
        level === AccountLevel.Zero
          ? "TRIAL ACCOUNT"
          : level === AccountLevel.One
          ? "FULL ACCOUNT"
          : level === AccountLevel.Two
          ? "BUSINESS ACCOUNT"
          : level === AccountLevel.NonAuth
          ? "LOGGED OUT"
          : LL.AccountScreen.level({ level }) // Fallback for other cases
      }
      leftIcon="people"
      action={() => {
        navigate("accountScreen")
      }}
    />
  )
}
