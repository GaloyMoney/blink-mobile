import { ScrollView } from "react-native-gesture-handler"

import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { VersionComponent } from "@app/components/version"
import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles } from "@rneui/themed"

import { AccountBanner } from "./account/banner"
import { EmailSetting } from "./account/settings/email"
import { PhoneSetting } from "./account/settings/phone"
import { SettingsGroup } from "./group"
import { DefaultWallet } from "./settings/account-default-wallet"
import { AccountLevelSetting } from "./settings/account-level"
import { AccountLNAddress } from "./settings/account-ln-address"
import { AccountPOS } from "./settings/account-pos"
import { AccountStaticQR } from "./settings/account-static-qr"
import { TxLimits } from "./settings/account-tx-limits"
import { ApiAccessSetting } from "./settings/advanced-api-access"
import { ExportCsvSetting } from "./settings/advanced-export-csv"
import { JoinCommunitySetting } from "./settings/community-join"
import { NeedHelpSetting } from "./settings/community-need-help"
import { CurrencySetting } from "./settings/preferences-currency"
import { LanguageSetting } from "./settings/preferences-language"
import { ThemeSetting } from "./settings/preferences-theme"
import { NotificationSetting } from "./settings/sp-notifications"
import { OnDeviceSecuritySetting } from "./settings/sp-security"
import { TotpSetting } from "./totp"

// All queries in settings have to be set here so that the server is not hit with
// multiple requests for each query
gql`
  query SettingsScreen {
    me {
      id
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

      # Authentication Stuff needed for account screen
      totpEnabled
      phone
      email {
        address
        verified
      }
    }
  }
`

export const SettingsScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { currentLevel, isAtLeastLevelOne } = useLevel()

  const items = {
    account: [AccountLevelSetting, TxLimits],
    loginMethods: [EmailSetting, PhoneSetting],
    waysToGetPaid: [AccountLNAddress, AccountPOS, AccountStaticQR],
    preferences: [
      NotificationSetting,
      DefaultWallet,
      LanguageSetting,
      CurrencySetting,
      ThemeSetting,
    ],
    securityAndPrivacy: [TotpSetting, OnDeviceSecuritySetting],
    advanced: [ExportCsvSetting, ApiAccessSetting],
    community: [NeedHelpSetting, JoinCommunitySetting],
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}>
        {currentLevel === AccountLevel.NonAuth && <AccountBanner />}
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
    marginTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 18,
  },
}))
