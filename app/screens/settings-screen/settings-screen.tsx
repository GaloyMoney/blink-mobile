import { makeStyles } from "@rneui/themed"
import { ScrollView } from "react-native-gesture-handler"

import { useI18nContext } from "@app/i18n/i18n-react"

import { Screen } from "@app/components/screen"
import { VersionComponent } from "@app/components/version"

import { SettingsGroup } from "./group"
import { AccountBanner } from "./settings/account-banner"
import { AccountLevelSetting } from "./settings/account-level"
import { AccountLNAddress } from "./settings/account-ln-address"
import { AccountPOS } from "./settings/account-pos"
import { DefaultWallet } from "./settings/account-default-wallet"
import { LanguageSetting } from "./settings/preferences-language"
import { CurrencySetting } from "./settings/preferences-currency"
import { ThemeSetting } from "./settings/preferences-theme"
import { SecuritySetting } from "./settings/sp-security"
import { NotificationSetting } from "./settings/sp-notifications"
import { ExportCsvSetting } from "./settings/advanced-export-csv"
import { NeedHelpSetting } from "./settings/community-need-help"
import { JoinCommunitySetting } from "./settings/community-join"
import { TxLimits } from "./settings/account-tx-limits"

export const SettingsScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const items = {
    account: [AccountLevelSetting, TxLimits, AccountLNAddress, AccountPOS],
    preferences: [
      NotificationSetting,
      DefaultWallet,
      LanguageSetting,
      CurrencySetting,
      ThemeSetting,
    ],
    securityAndPrivacy: [SecuritySetting],
    advanced: [ExportCsvSetting],
    community: [NeedHelpSetting, JoinCommunitySetting],
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}>
        <AccountBanner />
        <SettingsGroup name={LL.common.account()} items={items.account} />
        <SettingsGroup name={LL.common.preferences()} items={items.preferences} />
        <SettingsGroup
          name={LL.common.securityAndPrivacy()}
          items={items.securityAndPrivacy}
        />
        <SettingsGroup name={LL.common.advanced()} items={items.advanced} />
        <SettingsGroup name={LL.common.community()} items={items.community} />
        <VersionComponent />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  outer: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 18,
  },
}))
