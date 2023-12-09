import { View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"
import { AccountIcon } from "../settings/account-banner"

import { useAccountSettingsBannerQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useLevel } from "@app/graphql/level-context"

export const AccountHeader: React.FC = () => {
  const styles = useStyles()
  const { currentLevel: level } = useLevel()
  const { LL } = useI18nContext()

  const { data } = useAccountSettingsBannerQuery()
  const username = data?.me?.username ? `@${data?.me?.username}` : LL.common.blinkUser()

  return (
    <View style={styles.container}>
      <AccountIcon size={80} />
      <Text type="h2" bold>
        {username}
      </Text>
      <Text style={styles.topShorter}>{LL.AccountScreen.level({ level })}</Text>
    </View>
  )
}

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: 12,
    marginTop: 30,
  },
  topShorter: {
    marginTop: -6,
  },
}))
