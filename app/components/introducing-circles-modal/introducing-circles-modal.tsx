import * as React from "react"
import { Pressable, View } from "react-native"
import Modal from "react-native-modal"

import { makeStyles, useTheme, Text } from "@rneui/themed"

import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloyIcon } from "../atomic/galoy-icon"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import {
  PrimaryStackParamList,
  RootStackParamList,
} from "@app/navigation/stack-param-lists"
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"

const useStyles = makeStyles(({ colors }) => ({
  scrollViewStyle: {
    padding: 20,
    paddingTop: 40,
    display: "flex",
    flexDirection: "column",
    rowGap: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  peopleIcon: {
    color: colors.primary,
  },
  cross: {
    position: "absolute",
    top: 0,
    right: 30,
    padding: 10,
    marginTop: -10,
  },
  modalCard: {
    backgroundColor: colors.grey5,
    borderRadius: 16,
    paddingVertical: 10,
  },
  cardTitleContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    rowGap: 10,
    paddingHorizontal: 10,
  },
  cardActionsContainer: {
    flexDirection: "column",
  },
}))

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export const IntroducingCirclesModal: React.FC<Props> = ({ isVisible, setIsVisible }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const primaryNavigator =
    navigation.getParent<BottomTabNavigationProp<PrimaryStackParamList>>()

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const acknowledgeModal = () => {
    setIsVisible(false)
  }

  const navigateToCircles = () => {
    setIsVisible(false)
    primaryNavigator.navigate("People")
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.8}
      backdropColor={colors.white}
      onBackdropPress={acknowledgeModal}
    >
      <View style={styles.modalCard}>
        <View style={styles.scrollViewStyle}>
          <Pressable style={styles.cross} onPress={acknowledgeModal}>
            <GaloyIcon name="close" size={22} />
          </Pressable>
          <GaloyIcon name="people" color={colors.primary} size={50} />
          <View style={styles.cardTitleContainer}>
            <Text type="h1" bold>
              Introducing Circles
            </Text>
            <Text type="p1">
              Your circles grow as you welcome others to Blink – by sending somebody their
              first sats.
            </Text>
          </View>
          <View style={styles.cardActionsContainer}>
            <View>
              <GaloyPrimaryButton title="View My Circles" onPress={navigateToCircles} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
