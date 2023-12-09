/**
 * This component is the top banner on the settings screen
 * It shows the user their own username with a people icon
 * If the user isn't logged in, it shows Login or Create Account
 * Later on, this will support switching between accounts
 */

import { View } from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { Text, makeStyles, useTheme, Skeleton } from "@rneui/themed"

import { gql } from "@apollo/client"
import { useAccountSettingsBannerQuery } from "@app/graphql/generated"

import { useI18nContext } from "@app/i18n/i18n-react"
import { AccountLevel, useLevel } from "@app/graphql/level-context"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

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

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { currentLevel } = useLevel()
  const isUserLoggedIn = currentLevel !== AccountLevel.NonAuth

  const { data, loading } = useAccountSettingsBannerQuery({
    skip: !isUserLoggedIn,
  })
  const usernameTitle = data?.me?.username || LL.common.blinkUser()

  if (loading) return <Skeleton style={styles.outer} animation="pulse" />

  return (
    <TouchableWithoutFeedback
      onPress={() =>
        !isUserLoggedIn &&
        navigation.reset({
          index: 0,
          routes: [{ name: "getStarted" }],
        })
      }
    >
      <View style={styles.outer}>
        <AccountIcon size={30} />
        <Text type="p2">
          {isUserLoggedIn ? usernameTitle : LL.SettingsScreen.logInOrCreateAccount()}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

export const AccountIcon: React.FC<{ size: number }> = ({ size }) => {
  const {
    theme: { colors },
  } = useTheme()
  return <GaloyIcon name="user" size={size} backgroundColor={colors.grey4} />
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
