import { View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "@app/components/screen"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { InviteFriendsCard } from "./invite-friends-card"

export const CirclesDashboardHeaderRight: React.FC = () => {
  const styles = useStyles()

  return <Icon style={styles.shareButton} name="share-social-outline" />
}

export const CirclesDashboardScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  return (
    <Screen style={styles.screen} preset="scroll">
      <Text style={styles.description} type="p2">
        Your inner circle grows when you send a Blink user their first sats!
      </Text>
      <InviteFriendsCard />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  shareButton: {
    fontSize: 22,
    color: colors.black,
    paddingRight: 10,
  },
  screen: {
    padding: 10,
    display: "flex",
    flexDirection: "column",
    rowGap: 40,
  },
  description: {
    color: colors.grey3,
  },
}))
