import { makeStyles } from "@rneui/themed"
import { ScrollView } from "react-native-gesture-handler"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useLevel } from "@app/graphql/level-context"

import { AccountDeleteContextProvider } from "./account-delete-context"
import { SettingsContextProvider } from "../settings-context"
import { Screen } from "@app/components/screen"
import { AccountHeader } from "./header"
import { AccountId } from "./id"
import { SettingsGroup } from "../group"

import { EmailSetting } from "./settings/email"
import { PhoneSetting } from "./settings/phone"
import { DangerZoneSettings } from "./settings/danger-zone"
import { UpgradeTrialAccount } from "./settings/upgrade-trial-account"
import { UpgradeAccountLevelOne } from "./settings/upgrade"
import { TotpSetting } from "../totp"

export const AccountScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { isAtLeastLevelOne } = useLevel()

  const items = {
    authenticationMethods: [EmailSetting, PhoneSetting],
    misc: [TotpSetting, UpgradeAccountLevelOne],
  }

  return (
    <SettingsContextProvider>
      <AccountDeleteContextProvider>
        <Screen keyboardShouldPersistTaps="handled">
          <ScrollView contentContainerStyle={styles.outer}>
            <AccountHeader />
            <AccountId />
            <UpgradeTrialAccount />
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
    </SettingsContextProvider>
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
