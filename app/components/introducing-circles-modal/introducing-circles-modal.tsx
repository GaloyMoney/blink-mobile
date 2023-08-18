import React, { useEffect } from "react"
import { View } from "react-native"
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
import { GaloyIconButton } from "../atomic/galoy-icon-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { setIntroducingCirclesModalShown } from "@app/graphql/client-only-query"
import { useApolloClient } from "@apollo/client"
import { useIntroducingCirclesModalShownQuery } from "@app/graphql/generated"

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export const IntroducingCirclesModal: React.FC<Props> = ({ isVisible, setIsVisible }) => {
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const primaryNavigator =
    navigation.getParent<BottomTabNavigationProp<PrimaryStackParamList>>()

  const client = useApolloClient()
  const { data } = useIntroducingCirclesModalShownQuery()
  useEffect(() => {
    if (!data?.introducingCirclesModalShown) {
      setIsVisible(true)
      setIntroducingCirclesModalShown(client)
    }
  }, [data, client, setIsVisible])

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
        <View style={styles.containerStyle}>
          <View style={styles.cross}>
            <GaloyIconButton name="close" size="medium" onPress={acknowledgeModal} />
          </View>
          <GaloyIcon name="people" color={colors.primary} size={50} />
          <View style={styles.cardTitleContainer}>
            <Text type="h1" bold>
              {LL.Circles.introducingCircles()}
            </Text>
            <Text style={styles.textCenter} type="p1">
              {LL.Circles.circlesExplainer()}
            </Text>
          </View>
          <View style={styles.cardActionsContainer}>
            <View>
              <GaloyPrimaryButton
                title={LL.Circles.viewMyCircles()}
                onPress={navigateToCircles}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  containerStyle: {
    padding: 20,
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
    top: -20,
    right: 20,
  },
  modalCard: {
    backgroundColor: colors.grey5,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
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
  textCenter: {
    textAlign: "center",
  },
}))
