import { Text, makeStyles } from "@rneui/themed"

import { Screen } from "@app/components/screen"
import { Circle } from "@app/components/circle"
import { InviteFriendsCard } from "./invite-friends-card"
import { gql } from "@apollo/client"
import { ActivityIndicator, View } from "react-native"
import { useCirclesQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

gql`
  query Circles {
    me {
      defaultAccount {
        id
        ... on ConsumerAccount {
          welcomeProfile {
            allTimePoints
            allTimeRank
            innerCircleAllTimeCount
            innerCircleThisMonthCount
            leaderboardName
            outerCircleAllTimeCount
            outerCircleThisMonthCount
            thisMonthPoints
            thisMonthRank
          }
        }
      }
    }
  }
`

export const CirclesDashboardScreen: React.FC = () => {
  const styles = useStyles()

  const isAuthed = useIsAuthed()

  const { data } = useCirclesQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-first",
  })

  if (!data?.me?.defaultAccount.welcomeProfile)
    return (
      <View style={styles.activityIndicator}>
        <ActivityIndicator />
        <Text>Calculating your circles...</Text>
      </View>
    )

  const welcomeProfile = data?.me?.defaultAccount.welcomeProfile

  return (
    <Screen style={styles.screen} preset="scroll">
      <Text style={styles.description} type="p2">
        Your inner circle grows when you send a Blink user their first sats!
      </Text>
      <Circle
        heading="Inner circle"
        value={welcomeProfile.innerCircleAllTimeCount}
        minValue={1}
        maxValue={840}
        description="people you welcomed"
        subtitle={
          welcomeProfile.innerCircleThisMonthCount > 0
            ? `+ ${welcomeProfile.innerCircleThisMonthCount} this month`
            : ""
        }
        subtitleGreen
        bubble
        countUpDuration={1.2}
      />
      <Circle
        heading="Outer circle"
        value={data?.me?.defaultAccount.welcomeProfile.outerCircleAllTimeCount}
        minValue={1}
        maxValue={420}
        description="people welcomed by your circle"
        subtitle={
          welcomeProfile.outerCircleThisMonthCount > 0
            ? `+ ${welcomeProfile.outerCircleThisMonthCount} this month`
            : ""
        }
        subtitleGreen
        bubble
        countUpDuration={1.2}
      />
      <Circle
        heading="Your sphere"
        value={data?.me?.defaultAccount.welcomeProfile.allTimePoints}
        description="points"
        subtitle={`You're #${welcomeProfile.thisMonthRank} this month and #${welcomeProfile.allTimeRank} all time!`}
        tooltip="Total how much of an impact you are making"
        countUpDuration={1.8}
      />
      <InviteFriendsCard />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => {
  return {
    screen: {
      padding: 20,
      display: "flex",
      flexDirection: "column",
      rowGap: 40,
    },
    description: {
      color: colors.grey3,
    },
    activityIndicator: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      rowGap: 10,
    },
  }
})
