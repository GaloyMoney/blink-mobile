import { Alert, Share, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { gql } from "@apollo/client"
import { useInviteQuery } from "@app/graphql/generated"

import crashlytics from "@react-native-firebase/crashlytics"

gql`
  query invite {
    me {
      username
    }
  }
`

const getInviteLink = (username: string) => `https://get.blink.sv/${username}`

export const InviteFriendsCard = () => {
  const styles = useStyles()

  const { data } = useInviteQuery()

  const share = async () => {
    if (!data?.me?.username) return
    try {
      const result = await Share.share({ message: getInviteLink(data.me.username) })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (err) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
        Alert.alert(err.message)
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text type="p1">Invite Friends</Text>
      <View style={styles.iconContainer}>
        <GaloyIconButton name="share" size="medium" iconOnly onPress={share} />
        <GaloyIconButton name="qr-code" size="medium" iconOnly />
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    columnGap: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
  },
}))
