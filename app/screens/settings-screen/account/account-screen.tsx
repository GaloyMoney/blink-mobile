import { makeStyles } from "@rneui/themed"
import { ScrollView } from "react-native-gesture-handler"

import { useI18nContext } from "@app/i18n/i18n-react"

import { Screen } from "@app/components/screen"
import { AccountHeader } from "./header"
import { AccountId } from "./id"
import { SettingsGroup } from "../group"

import { EmailSetting } from "./settings/email"
import { PhoneSetting } from "./settings/phone"
import { TxLimits } from "./settings/tx-limits"

export const AccountScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const items = {
    authenticationMethods: [EmailSetting, PhoneSetting],
    misc: [TxLimits],
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}>
        <AccountHeader />
        <AccountId />
        <SettingsGroup
          name={LL.AccountScreen.loginMethods()}
          items={items.authenticationMethods}
        />
        <SettingsGroup items={items.misc} />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  outer: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
  },
}))
