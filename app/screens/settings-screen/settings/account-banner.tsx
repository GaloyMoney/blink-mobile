/**
 * This component is the top banner on the settings screen
 * It shows the user their own username with a people icon
 * If the user isn't logged in, it shows Login or Create Account
 * Later on, this will support switching between accounts
 */

import { View } from "react-native"
import { Text, makeStyles, useTheme, Skeleton } from "@rneui/themed"

import { gql } from "@apollo/client"
import { useAccountSettingsBannerQuery } from "@app/graphql/generated"

import { useI18nContext } from "@app/i18n/i18n-react"
import { AccountLevel, useLevel } from "@app/graphql/level-context"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"

gql`
  query AccountSettingsBanner {
    me {
      username
    }
  }
`

export const AccountBanner = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { currentLevel } = useLevel()
  const { data, loading } = useAccountSettingsBannerQuery()
  const usernameTitle = data?.me?.username || LL.common.account()

  if (loading) return <Skeleton style={styles.outer} animation="pulse" />

  return (
    <View style={styles.outer}>
      <AccountIcon />
      <Text type="p2">
        {currentLevel === AccountLevel.NonAuth
          ? LL.SettingsScreen.logInOrCreateAccount()
          : usernameTitle}
      </Text>
    </View>
  )
}

const AccountIcon = () => {
  const {
    theme: { colors },
  } = useTheme()
  return <GaloyIcon name="user" size={30} backgroundColor={colors.grey4} />
}

const useStyles = makeStyles(() => ({
  outer: {
    height: 70,
    padding: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
}))
