import { Text, makeStyles } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "@app/components/screen"
import { Circle } from "@app/components/circle"
import { InviteFriendsCard } from "./invite-friends-card"

export const CirclesDashboardHeaderRight: React.FC = () => {
  const styles = useStyles()

  return <Icon style={styles.shareButton} name="share-social-outline" />
}

export const CirclesDashboardScreen: React.FC = () => {
  const styles = useStyles()

  return (
    <Screen style={styles.screen} preset="scroll">
      <Text style={styles.description} type="p2">
        Your inner circle grows when you send a Blink user their first sats!
      </Text>
      <Circle
        heading="Inner circle"
        value={3}
        minValue={1}
        maxValue={840}
        description="people you onboarded"
        subtitle="+3 this month"
        subtitleGreen
        bubble
        countUpDuration={1}
      />
      <Circle
        heading="Outer circle"
        value={10}
        minValue={1}
        maxValue={420}
        description="people onboarded by your inner circle"
        subtitle="+34 this month"
        subtitleGreen
        bubble
        countUpDuration={1}
      />
      <Circle
        heading="Your sphere"
        value={740}
        description="points"
        subtitle="4 degrees of separation achieved"
        tooltip="Total how much of an impact you are making"
        countUpDuration={1}
      />
      <InviteFriendsCard />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => {
  return {
    shareButton: {
      fontSize: 22,
      color: colors.black,
      paddingRight: 10,
    },
    screen: {
      padding: 20,
      display: "flex",
      flexDirection: "column",
      rowGap: 40,
    },
    description: {
      color: colors.grey3,
    },
  }
})
