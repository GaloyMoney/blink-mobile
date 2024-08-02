import * as React from "react"
import { gql } from "@apollo/client"
import { makeStyles } from "@rneui/themed"
import { ScrollView } from "react-native-gesture-handler"
import { useLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"

import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { AccountLNAddress } from "./settings/account-ln-address"
import { AccountLevelSetting } from "./settings/account-level"
import { AccountStaticQR } from "./settings/account-static-qr"
import { TxLimits } from "./settings/account-tx-limits"
import { PhoneSetting } from "./account/settings/phone"
import { AccountPOS } from "./settings/account-pos"
import { DefaultWallet } from "./settings/account-default-wallet"
import { LanguageSetting } from "./settings/preferences-language"
import { CurrencySetting } from "./settings/preferences-currency"
import { ThemeSetting } from "./settings/preferences-theme"
import { OnDeviceSecuritySetting } from "./settings/sp-security"
import { NeedHelpSetting } from "./settings/community-need-help"
import { NotificationSetting } from "./settings/sp-notifications"
import { JoinCommunitySetting } from "./settings/community-join"
import { NostrSecret } from "./settings/nostr-secret"
import { BackupWallet } from "./settings/backup-wallet"
import { ImportWallet } from "./settings/import-wallet"
import { AdvancedModeToggle } from "./settings/advanced-mode-toggle"
import { ExportCsvSetting } from "./settings/advanced-export-csv"
import { ApiAccessSetting } from "./settings/advanced-api-access"
import { SettingsGroup } from "./group"
import { EmailSetting } from "./account/settings/email"
import { TotpSetting } from "./totp"

gql`
  query settingsScreen {
    me {
      id
      phone
      username
      language
      defaultAccount {
        id
        defaultWalletId
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

const items = {
  account: [AccountLevelSetting, AdvancedModeToggle, TxLimits],
  loginMethods: [EmailSetting, PhoneSetting],
  waysToGetPaid: [AccountLNAddress, AccountPOS, AccountStaticQR],
  wallet: [NostrSecret, BackupWallet, ImportWallet],
  preferences: [
    NotificationSetting,
    DefaultWallet,
    LanguageSetting,
    CurrencySetting,
    ThemeSetting,
  ],
  securityAndPrivacy: [
    // TotpSetting,
    OnDeviceSecuritySetting,
  ],
  advanced: [
    ExportCsvSetting,
    //  ApiAccessSetting
  ],
  community: [NeedHelpSetting, JoinCommunitySetting],
}

export const SettingsScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { isAtLeastLevelOne } = useLevel()

  return (
    <Screen preset="scroll" keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}>
        <SettingsGroup name={LL.common.account()} items={items.account} />
        {isAtLeastLevelOne && (
          <SettingsGroup
            name={LL.AccountScreen.loginMethods()}
            items={items.loginMethods}
          />
        )}
        <SettingsGroup
          name={LL.SettingsScreen.addressScreen()}
          items={items.waysToGetPaid}
        />
        <SettingsGroup name={LL.SettingsScreen.keysManagement()} items={items.wallet} />
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

const useStyles = makeStyles(({ colors }) => ({
  outer: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 18,
  },
  headerRight: {
    marginRight: 12,
  },
  notificationCount: {
    position: "absolute",
    right: 9,
    top: -3,
    color: colors._darkGrey,
    backgroundColor: colors.primary,
    textAlign: "center",
    verticalAlign: "middle",
    height: 18,
    width: 18,
    borderRadius: 9,
    overflow: "hidden",
  },
}))
