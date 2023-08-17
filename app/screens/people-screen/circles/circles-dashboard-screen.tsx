import { Text, makeStyles } from "@rneui/themed"

import { Screen } from "@app/components/screen"
import { Circle } from "@app/components/circle"
import { InviteFriendsCard } from "./invite-friends-card"
import { gql } from "@apollo/client"
import { ActivityIndicator, View } from "react-native"
import { useCirclesQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"

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
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()

  const { data } = useCirclesQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-first",
  })

  if (!data?.me?.defaultAccount.welcomeProfile)
    return (
      <View style={styles.activityIndicator}>
        <ActivityIndicator />
        <Text>{LL.Circles.calculatingYourCircles()}</Text>
      </View>
    )

  const welcomeProfile = data?.me?.defaultAccount.welcomeProfile

  return (
    <Screen style={styles.screen} preset="scroll">
      <Text style={styles.description} type="p2">
        {LL.Circles.innerCircleExplainer()}
      </Text>
      <Circle
        heading={LL.Circles.innerCircle()}
        value={welcomeProfile.innerCircleAllTimeCount}
        minValue={1}
        maxValue={840}
        description={LL.Circles.peopleYouWelcomed()}
        subtitle={
          welcomeProfile.innerCircleThisMonthCount > 0
            ? `+ ${welcomeProfile.innerCircleThisMonthCount} ${LL.Circles.thisMonth()}`
            : ""
        }
        subtitleGreen
        bubble
        countUpDuration={1.2}
      />
      <Circle
        heading={LL.Circles.outerCircle()}
        value={data?.me?.defaultAccount.welcomeProfile.outerCircleAllTimeCount}
        minValue={1}
        maxValue={420}
        description={LL.Circles.peopleWelcomedByYourCircle()}
        subtitle={
          welcomeProfile.outerCircleThisMonthCount > 0
            ? `+ ${welcomeProfile.outerCircleThisMonthCount} ${LL.Circles.thisMonth()}`
            : ""
        }
        subtitleGreen
        bubble
        countUpDuration={1.2}
      />
      <Circle
        heading={LL.Circles.yourSphere()}
        value={data?.me?.defaultAccount.welcomeProfile.allTimePoints}
        description={LL.Circles.points()}
        subtitle={LL.Circles.yourRankMessage({
          thisMonthRank: welcomeProfile.thisMonthRank,
          allTimeRank: welcomeProfile.allTimeRank,
        })}
        tooltip={LL.Circles.totalImpact()}
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
