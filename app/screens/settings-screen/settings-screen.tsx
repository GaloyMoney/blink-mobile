import { View } from "react-native"
import { Divider, makeStyles, Text, useTheme } from "@rneui/themed"
import { ScrollView } from "react-native-gesture-handler"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useLevel } from "@app/graphql/level-context"

import { Screen } from "@app/components/screen"

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
import { VersionComponent } from "@app/components/version"
import { NeedHelpSetting } from "./settings/community-need-help"
import { JoinCommunitySetting } from "./settings/community-join"

export const SettingsScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { isAtLeastLevelZero } = useLevel()

  const items = {
    account: [AccountLevelSetting, AccountLNAddress, AccountPOS, DefaultWallet],
    preferences: [LanguageSetting, CurrencySetting, ThemeSetting],
    securityAndPrivacy: [SecuritySetting, NotificationSetting],
    advanced: [ExportCsvSetting],
    community: [NeedHelpSetting, JoinCommunitySetting],
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}>
        <AccountBanner />
        {isAtLeastLevelZero && (
          <>
            <SettingsGroup name={LL.common.account()} items={items.account} />
            <SettingsGroup name={LL.common.preferences()} items={items.preferences} />
            <SettingsGroup
              name={LL.common.securityAndPrivacy()}
              items={items.securityAndPrivacy}
            />
            <SettingsGroup name={LL.common.advanced()} items={items.advanced} />
          </>
        )}
        <SettingsGroup name={LL.common.community()} items={items.community} />
        <VersionComponent />
      </ScrollView>
    </Screen>
  )
}

const SettingsGroup: React.FC<{
  name: string
  items: React.FC[]
}> = ({ name, items }) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  return (
    <View>
      <Text type="p2" bold>
        {name}
      </Text>
      <View style={styles.groupCard}>
        {items.map((Element, index) => (
          <View key={index}>
            <Element />
            {index < items.length - 1 && (
              <Divider color={colors.grey4} style={styles.divider} />
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  outer: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
  },
  groupCard: {
    marginTop: 5,
    backgroundColor: colors.grey5,
    borderRadius: 12,
    overflow: "hidden",
  },
  divider: {
    marginHorizontal: 10,
  },
}))
