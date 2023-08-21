import { Text, makeStyles } from "@rneui/themed"

import { Screen } from "@app/components/screen"
import { Circle } from "@app/components/circle"
import { gql } from "@apollo/client"
import { ActivityIndicator, View } from "react-native"
import { useCirclesQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ShareCircles } from "./share-circles-card"
import { SeptemberChallengeCard } from "@app/components/september-challenge"

gql`
  query Circles {
    me {
      username
      defaultAccount {
        id
        ... on ConsumerAccount {
          welcomeProfile {
            allTimePoints
            allTimeRank
            innerCircleAllTimeCount
            innerCircleThisMonthCount
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

  const { data, loading } = useCirclesQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
  })

  if (loading)
    return (
      <View style={styles.activityIndicator}>
        <ActivityIndicator />
        <Text>{LL.Circles.calculatingYourCircles()}</Text>
      </View>
    )

  const welcomeProfile = data?.me?.defaultAccount.welcomeProfile
  const isLonely = !welcomeProfile || welcomeProfile.innerCircleAllTimeCount === 0

  return (
    <Screen style={styles.screen} preset="scroll">
      <Text style={styles.description} type={isLonely ? "p1" : "p2"}>
        {isLonely ? LL.Circles.innerCircleGrow() : LL.Circles.innerCircleExplainer()}
      </Text>
      {isLonely ? (
        <View style={styles.groupContainer}>
          <View style={styles.circle} />
          <Text type="p1" style={styles.groupEffort}>
            {LL.Circles.groupEffort()}
          </Text>
        </View>
      ) : (
        <>
          <Circle
            heading={LL.Circles.innerCircle()}
            value={welcomeProfile.innerCircleAllTimeCount}
            minValue={1}
            maxValue={180}
            description={LL.Circles.peopleYouWelcomed()}
            subtitle={
              welcomeProfile.innerCircleThisMonthCount > 0
                ? `+ ${
                    welcomeProfile.innerCircleThisMonthCount
                  } ${LL.Circles.thisMonth()}; rank: #${welcomeProfile.thisMonthRank}`
                : ""
            }
            subtitleGreen
            bubble
            countUpDuration={1.8}
          />
          <Circle
            heading={LL.Circles.outerCircle()}
            value={data?.me?.defaultAccount.welcomeProfile.outerCircleAllTimeCount}
            minValue={1}
            maxValue={180}
            description={LL.Circles.peopleWelcomedByYourCircle()}
            subtitle={
              welcomeProfile.outerCircleThisMonthCount > 0
                ? `+ ${
                    welcomeProfile.outerCircleThisMonthCount
                  } ${LL.Circles.thisMonth()}`
                : ""
            }
            subtitleGreen
            bubble
            countUpDuration={1.8}
          />
          <Text style={styles.textCenter} type="p2">
            {LL.Circles.yourRankMessage({
              thisMonthRank: welcomeProfile.thisMonthRank,
              allTimeRank: welcomeProfile.allTimeRank,
            })}
          </Text>
        </>
      )}
      <SeptemberChallengeCard />
      <ShareCircles />
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
    textCenter: {
      textAlign: "center",
    },
    activityIndicator: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      rowGap: 10,
    },
    groupContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "40%",
      marginBottom: "10%",
    },
    groupEffort: {
      textAlign: "center",
      color: colors.grey3,
    },
    circle: {
      position: "absolute",
      height: 150,
      width: 150,
      borderRadius: 75,
      backgroundColor: colors.backdropWhite,
    },
  }
})
