import { useCirclesQuery, WelcomeProfile } from "@app/graphql/generated"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { forwardRef, useMemo, useRef } from "react"
import { View, Share as NativeShare } from "react-native"

import LogoDarkMode from "@app/assets/logo/app-logo-dark.svg"
import LogoLightMode from "@app/assets/logo/blink-logo-light.svg"

import { captureRef } from "react-native-view-shot"
import Share from "react-native-share"
import { Circle } from "@app/components/circle"
import { LinearGradient } from "react-native-linear-gradient"
import crashlytics from "@react-native-firebase/crashlytics"
import { useI18nContext } from "@app/i18n/i18n-react"
import { getInviteLink } from "@app/config/appinfo"
import { useAppConfig } from "@app/hooks"

export const useCirclesCard = () => {
  const shareImgRef = useRef<View | null>(null)
  const { LL } = useI18nContext()

  const { data } = useCirclesQuery()

  const username = data?.me?.username || ""
  const welcomeProfile = data?.me?.defaultAccount.welcomeProfile

  const ShareImg = useMemo(() => {
    if (welcomeProfile)
      return (
        <ShareImageComponent
          ref={shareImgRef}
          username={username}
          welcomeProfile={welcomeProfile}
        />
      )
    return <></>
  }, [username, welcomeProfile])

  const share = async () => {
    try {
      if (!welcomeProfile || welcomeProfile?.innerCircleAllTimeCount === 0) {
        const inviteLink = getInviteLink(data?.me?.username)
        await NativeShare.share({ message: inviteLink })
        return
      }

      if (!shareImgRef.current) return

      const uri = await captureRef(shareImgRef.current, {
        format: "jpg",
        quality: 1.0,
      })

      const shareName = `${LL.Circles.someones({
        username,
      })} ${LL.Circles.titleBlinkCircles()}`

      const shareOptions = {
        fileName: shareName,
        title: shareName,
        url: uri,
        type: "image/jpeg",
      }

      await Share.open(shareOptions)
    } catch (error) {
      crashlytics().log("User didn't share")
    }
  }

  return { ShareImg, share }
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
      theme: { colors, mode },
    } = useTheme()
    const { LL } = useI18nContext()

    const appConfig = useAppConfig().appConfig
    const lnAddressHostname = appConfig.galoyInstance.lnAddressHostname
    const lnAddress = `${username}@${lnAddressHostname}`

    const Logo = mode === "dark" ? LogoDarkMode : LogoLightMode

    return (
      <View ref={ref} style={styles.shareContainer}>
        <Logo style={styles.logo} height={60} />
        <View style={styles.usernameContainer}>
          <LinearGradient
            style={styles.usernameContainerGrad}
            colors={["#FB5607", "#FFBE0B"]}
            useAngle={true}
            angle={216}
            angleCenter={{ x: 0.5, y: 0.5 }}
          >
            <Text type="h1" style={styles.boldText} color={colors._black}>
              {LL.Circles.myBlinkCircles()}
            </Text>
            <Text type="p2" color={colors._black}>
              {lnAddress}
            </Text>
          </LinearGradient>
        </View>
        <Text type="p2" style={styles.description}>
          {LL.Circles.innerCircleExplainerCard()}
        </Text>
        <Circle
          heading={LL.Circles.innerCircle()}
          value={welcomeProfile.innerCircleAllTimeCount}
          minValue={1}
          maxValue={180}
          description={LL.Circles.peopleIWelcomed()}
          subtitle={
            welcomeProfile.innerCircleThisMonthCount > 0
              ? `+ ${welcomeProfile.innerCircleThisMonthCount} ${LL.Circles.thisMonth()}`
              : ""
          }
          subtitleGreen
          bubble
          countUpDuration={0}
        />
        <Circle
          heading={LL.Circles.outerCircle()}
          value={welcomeProfile.outerCircleAllTimeCount}
          minValue={1}
          maxValue={180}
          description={LL.Circles.peopleWelcomedByMyCircle()}
          subtitle={
            welcomeProfile.outerCircleThisMonthCount > 0
              ? `+ ${welcomeProfile.outerCircleThisMonthCount} ${LL.Circles.thisMonth()}`
              : ""
          }
          subtitleGreen
          bubble
          countUpDuration={0}
        />
        <Circle
          heading={LL.Circles.mySphere()}
          value={welcomeProfile.allTimePoints}
          description={LL.Circles.points()}
          subtitle={
            welcomeProfile.thisMonthPoints > 0
              ? `+ ${welcomeProfile.thisMonthPoints} ${LL.Circles.thisMonth()}`
              : ""
          }
          subtitleGreen
          extraSubtitleLine={LL.Circles.rankMessage({
            thisMonthRank: welcomeProfile.thisMonthRank,
            allTimeRank: welcomeProfile.allTimeRank,
          })}
          countUpDuration={0}
        />
        <View style={styles.buildUrCircle}>
          <Text type="p2">{LL.Circles.buildYourCircle()} </Text>
          <Text type="p1" style={styles.boldText} color={colors.primary}>
            get.blink.sv
          </Text>
        </View>
      </View>
    )
  })

const useStyles = makeStyles(({ colors, mode }) => ({
  shareContainer: {
    top: -10000,
    left: -10000,

    // // /* Enable these and disable top two to debug view
    // top: 0,
    // left: "-10%",
    // borderWidth: 1,
    // borderColor: colors.red,
    // zIndex: 5,
    // transform: [
    //   {
    //     scale: 0.6,
    //   },
    // ],
    // // */

    height: 560,
    width: 420,
    backgroundColor: mode === "light" ? colors.white : colors.grey5,
    position: "absolute",

    display: "flex",
    flexDirection: "column",
    rowGap: 18,
    justifyContent: "center",

    paddingTop: 100,
    overflow: "hidden",
  },
  buildUrCircle: {
    paddingHorizontal: 40,
  },
  logo: {
    position: "absolute",
    padding: 80,
    right: 0,
    bottom: -35,
  },
  usernameContainer: {
    position: "absolute",
    minWidth: "80%",
    top: 0,
    // left: -12,
  },
  usernameContainerGrad: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomRightRadius: 40,
  },
  description: {
    position: "absolute",
    top: 110,
    right: 30,
    width: 140,
    textAlign: "left",
    color: colors.grey3,
  },
  boldText: { fontWeight: "700" },
}))
