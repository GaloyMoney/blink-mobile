import { Text, makeStyles, useTheme } from "@rneui/themed"

import { Circle, CircleRef } from "@app/components/circle"
import { gql } from "@apollo/client"
import { RefreshControl, ScrollView, View } from "react-native"
import { useCirclesQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ShareCircles } from "./share-circles-card"
import { SeptemberChallengeCard } from "@app/components/september-challenge"

import LogoDarkMode from "@app/assets/logo/app-logo-dark.svg"
import LogoLightMode from "@app/assets/logo/blink-logo-light.svg"
import { useRef, useState } from "react"
import { InviteFriendsCard } from "./invite-friends-card"

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
  const {
    theme: { mode, colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()

  const innerCircleRef = useRef<CircleRef | null>(null)
  const outerCircleRef = useRef<CircleRef | null>(null)

  const [loading, setLoading] = useState(false)

  const { data, refetch: refetchCirclesData } = useCirclesQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-first",
  })

  const refetch = async () => {
    setLoading(true)
    await refetchCirclesData()
    setLoading(false)
    innerCircleRef.current?.reset()
    outerCircleRef.current?.reset()
  }

  const welcomeProfile = data?.me?.defaultAccount.welcomeProfile
  const isLonely = !welcomeProfile || welcomeProfile.innerCircleAllTimeCount === 0

  const Logo = mode === "dark" ? LogoDarkMode : LogoLightMode

  return (
    <ScrollView
      contentContainerStyle={[styles.screen]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          colors={[colors.primary]} // Android refresh indicator colors
          tintColor={colors.primary} // iOS refresh indicator color
        />
      }
    >
      <Text style={styles.description} type={isLonely ? "p1" : "p2"}>
        {isLonely ? LL.Circles.innerCircleGrow() : LL.Circles.innerCircleExplainer()}
      </Text>
      {!isLonely && (
        <View style={styles.logoContainer}>
          <Logo height={60} />
        </View>
      )}
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
            ref={innerCircleRef}
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
            ref={outerCircleRef}
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
      {isLonely ? <InviteFriendsCard /> : <ShareCircles />}
    </ScrollView>
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
    logoContainer: {
      top: 90,
      left: "60%",
      width: "50%",
      height: "100%",
      position: "absolute",
    },
  }
})
