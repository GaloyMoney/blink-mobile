import { Alert, Animated, Easing, Pressable, Share, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

import { useRef, useState } from "react"

import { gql } from "@apollo/client"
import { useInviteQuery } from "@app/graphql/generated"

import crashlytics from "@react-native-firebase/crashlytics"
import { InviteModal } from "@app/components/invite-modal"
import { getInviteLink } from "@app/config/appinfo"
import { useI18nContext } from "@app/i18n/i18n-react"

gql`
  query invite {
    me {
      username
    }
  }
`

export const InviteFriendsCard = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false)

  const { data } = useInviteQuery()

  const share = async () => {
    try {
      const result = await Share.share({ message: getInviteLink(data?.me?.username) })

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

  const openInviteModal = () => setIsInviteModalVisible(true)

  const scaleAnim = useRef(new Animated.Value(1)).current

  const breatheIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  const breatheOut = () => {
    openInviteModal()
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  return (
    <Pressable onPressIn={breatheIn} onPressOut={breatheOut}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.container}>
          <InviteModal
            isVisible={isInviteModalVisible}
            setIsVisible={setIsInviteModalVisible}
          />
          <Text type="p1">{LL.Circles.inviteFriends()}</Text>
          <View style={styles.iconContainer}>
            <GaloyIconButton name="share" size="medium" iconOnly onPress={share} />
            <GaloyIconButton
              name="qr-code"
              size="medium"
              iconOnly
              onPress={openInviteModal}
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
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
