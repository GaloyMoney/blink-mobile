import { gql } from "@apollo/client"
import { useCirclesSharesQuery, WelcomeProfile } from "@app/graphql/generated"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { forwardRef, useMemo, useRef } from "react"
import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import Logo from "@app/assets/logo/app-logo-dark.svg"

import { captureRef } from "react-native-view-shot"
import Share from "react-native-share"
import { Circle } from "@app/components/circle"
import { LinearGradient } from "react-native-linear-gradient"

gql`
  query CirclesShares {
    me {
      username
      defaultAccount {
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

export const CirclesDashboardHeaderRight: React.FC = () => {
  const shareImgRef = useRef<View | null>(null)
  const styles = useStyles()

  const { data } = useCirclesSharesQuery()

  const ShareImg = useMemo(() => {
    const username = data?.me?.username
    const welcomeProfile = data?.me?.defaultAccount.welcomeProfile

    if (username && welcomeProfile)
      return (
        <ShareImageComponent
          ref={shareImgRef}
          username={data?.me?.username}
          welcomeProfile={data.me.defaultAccount.welcomeProfile}
        />
      )
    return <></>
  }, [data?.me?.defaultAccount.welcomeProfile, data?.me?.username])

  const share = async () => {
    try {
      if (!shareImgRef.current) return

      const uri = await captureRef(shareImgRef.current, {
        format: "jpg",
        quality: 1.0,
      })

      const shareOptions = {
        fileName: `${data?.me?.username}'s Blink Circles`,
        message: `${data?.me?.username}'s Blink Circles`,
        url: uri,
        type: "image/jpeg",
      }

      Share.open(shareOptions)
    } catch (error) {
      console.error("Error sharing image:", error)
    }
  }

  return (
    <>
      {ShareImg}
      {/* This is rendered off screen */}
      <Icon onPress={share} style={styles.shareButton} name="share-social-outline" />
    </>
  )
}

type ShareImageProps = {
  username: string
  welcomeProfile: WelcomeProfile
}
const ShareImageComponent: React.FC<ShareImageProps & React.RefAttributes<View>> =
  // eslint-disable-next-line react/display-name
  forwardRef(({ username, welcomeProfile }, ref) => {
    const styles = useStyles()
    const {
      theme: { colors },
    } = useTheme()

    return (
      <View ref={ref} style={styles.shareContainer}>
        <Logo style={styles.logo} height={80} />
        <View style={styles.usernameContainer}>
          <LinearGradient
            style={styles.usernameContainerGrad}
            colors={["#FB5607", "#FFBE0B"]}
            useAngle={true}
            angle={216}
            angleCenter={{ x: 0.5, y: 0.5 }}
          >
            <Text type="p2" color={colors._black} bold>
              {username}'s
            </Text>
            <Text type="p1" color={colors._black}>
              circles
            </Text>
          </LinearGradient>
        </View>
        <Text style={styles.description}>
          Your inner circle grows when you send a Blink user their first sats.
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
          countUpDuration={0}
        />
        <Circle
          heading="Outer circle"
          value={welcomeProfile.outerCircleAllTimeCount}
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
          countUpDuration={0}
        />
        <Circle
          heading="Your sphere"
          value={welcomeProfile.allTimePoints}
          description="points"
          subtitle={`You're #${welcomeProfile.thisMonthRank} this month and #${welcomeProfile.allTimeRank} all time!`}
          countUpDuration={0}
        />
        <Text style={styles.buildUrCircle}>
          <Text type="p2">Build your circle </Text>
          <Text type="p1" color={colors.primary} bold>
            get.blink.sv
          </Text>
        </Text>
      </View>
    )
  })

const useStyles = makeStyles(({ colors }) => ({
  shareButton: {
    fontSize: 22,
    color: colors.black,
    paddingRight: 10,
  },
  shareContainer: {
    top: -10000,
    left: -10000,

    // // /* Enable these and disable top two to debug view
    // top: 20,
    // borderWidth: 1,
    // borderColor: colors.red,
    // // */

    height: 520,
    width: 400,
    backgroundColor: colors.white,
    position: "absolute",

    display: "flex",
    flexDirection: "column",
    rowGap: 20,
    justifyContent: "center",

    paddingTop: 100,
    overflow: "hidden",
  },
  buildUrCircle: {
    paddingHorizontal: 40,
  },
  logo: {
    position: "absolute",
    padding: 100,
    right: 0,
    top: -40,
  },
  usernameContainer: {
    position: "absolute",
    top: -2,
    left: -8,
  },
  usernameContainerGrad: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderBottomRightRadius: 40,
  },
  description: {
    position: "absolute",
    top: 140,
    right: 30,
    width: 130,
    textAlign: "right",
    color: colors.grey3,
  },
}))
