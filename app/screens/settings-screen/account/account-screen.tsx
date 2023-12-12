import { makeStyles } from "@rneui/themed"
import { ScrollView } from "react-native-gesture-handler"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useLevel } from "@app/graphql/level-context"

import { AccountDeleteContextProvider } from "./account-delete-context"
import { Screen } from "@app/components/screen"
import { AccountHeader } from "./header"
import { AccountId } from "./id"
import { SettingsGroup } from "../group"

import { EmailSetting } from "./settings/email"
import { PhoneSetting } from "./settings/phone"
import { DangerZoneSettings } from "./settings/danger-zone"
import { UpgradeTrialAcccount } from "./settings/upgrade-trial-account"
import { UpgradeAcccountLevelOne } from "./settings/upgrade"

export const AccountScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { isAtLeastLevelOne } = useLevel()

  const items = {
    authenticationMethods: [EmailSetting, PhoneSetting],
    misc: [UpgradeAcccountLevelOne],
  }

  return (
    <AccountDeleteContextProvider>
      <Screen keyboardShouldPersistTaps="handled">
        <ScrollView contentContainerStyle={styles.outer}>
          <AccountHeader />
          <AccountId />
          <UpgradeTrialAcccount />
          {isAtLeastLevelOne && (
            <SettingsGroup
              name={LL.AccountScreen.loginMethods()}
              items={items.authenticationMethods}
            />
          )}
          <SettingsGroup items={items.misc} />
          <DangerZoneSettings />
        </ScrollView>
      </Screen>
    </AccountDeleteContextProvider>
  )
}

const useStyles = makeStyles(() => ({
  outer: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
  },
}))
