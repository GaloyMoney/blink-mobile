import { gql } from "@apollo/client"
import { useCirclesSharesQuery } from "@app/graphql/generated"
import { makeStyles, Text } from "@rneui/themed"
import { forwardRef, useMemo, useRef } from "react"
import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { captureRef } from "react-native-view-shot"
import Share from "react-native-share"

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
  // this line is erroring, what should be the typescript type?
  const shareImgRef = useRef<View | null>(null)
  const styles = useStyles()

  const { data } = useCirclesSharesQuery()

  const ShareImg = useMemo(() => {
    const username = data?.me?.username
    const innerCircle = data?.me?.defaultAccount.welcomeProfile?.innerCircleAllTimeCount
    const outerCircle = data?.me?.defaultAccount.welcomeProfile?.outerCircleAllTimeCount
    const sphere = data?.me?.defaultAccount.welcomeProfile?.allTimeRank

    if (username && innerCircle && outerCircle && sphere)
      return (
        <ShareImageComponent
          ref={shareImgRef}
          username={data?.me?.username}
          innerCircle={innerCircle}
          outerCircle={outerCircle}
          sphere={sphere}
        />
      )
    return <></>
  }, [
    data?.me?.defaultAccount.welcomeProfile?.allTimeRank,
    data?.me?.defaultAccount.welcomeProfile?.innerCircleAllTimeCount,
    data?.me?.defaultAccount.welcomeProfile?.outerCircleAllTimeCount,
    data?.me?.username,
  ])

  const share = async () => {
    try {
      if (!shareImgRef.current) return

      const uri = await captureRef(shareImgRef.current, {
        format: "png",
        quality: 0.8,
      })

      const shareOptions = {
        title: "Share Image",
        url: uri,
        type: "image/png",
      }

      Share.open(shareOptions)
    } catch (error) {
      console.error("Error sharing image:", error)
    }
  }

  return (
    <>
      {ShareImg}
      <Icon onPress={share} style={styles.shareButton} name="share-social-outline" />
    </>
  )
}

type ShareImageProps = {
  username: string
  innerCircle: number
  outerCircle: number
  sphere: number
}
const ShareImageComponent: React.FC<ShareImageProps & React.RefAttributes<View>> =
  // eslint-disable-next-line react/display-name
  forwardRef(({ username, innerCircle, outerCircle, sphere }, ref) => {
    const styles = useStyles()

    return (
      <View ref={ref} style={styles.shareContainer}>
        <Text color="#000000">{username}</Text>
        <Text color="#000000">{innerCircle}</Text>
        <Text color="#000000">{outerCircle}</Text>
        <Text color="#000000">{sphere}</Text>
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
    height: 200,
    width: 200,
    // Move it well off-screen
    position: "absolute",
    top: -1000,
    left: -1000,
  },
}))
