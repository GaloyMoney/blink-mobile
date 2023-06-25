import React, { useEffect } from "react"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { Screen } from "@app/components/screen"
import {
  SuccessIconAnimation,
  SuccessTextAnimation,
} from "@app/components/success-animation"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { View, TextInput } from "react-native"
import { testProps } from "../../utils/testProps"
import Modal from "react-native-modal"
import { GaloySecondaryButton } from "../../components/atomic/galoy-secondary-button"
import Rate from "react-native-rate"
import { ratingOptions } from "@app/config"
import crashlytics from "@react-native-firebase/crashlytics"
import { GaloyPrimaryButton } from "../../components/atomic/galoy-primary-button"
import { useHomeAuthedQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const SendBitcoinSuccessScreen = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const [IsActive, setIsActive] = React.useState(false)
  const isAuthed = useIsAuthed()
  const [showImprovement, setshowImprovement] = React.useState(false)
  const [improvement, setImprovement] = React.useState("")
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinSuccess">>()

  const { data: dataAuthed } = useHomeAuthedQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    errorPolicy: "all",
    // this enables offline mode use-case
    nextFetchPolicy: "cache-and-network",
  })
  const submitImprovement = async () => {
    navigation.popToTop()
    setshowImprovement(false)
    // await fetch("https://chat.galoy.io/api/v4/posts", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `bearer personal_access_token`,
    //   },
    //   body: JSON.stringify({
    //     // eslint-disable-next-line camelcase
    //     channel_id: "n59hg9abetdrtygof11kncjbdw",
    //     message: improvement,
    //   }),
    // }).then(() => {
    //   setshowImprovement(false)
    //   navigation.popToTop()
    // })
  }

  const dismiss = () => {
    setIsActive(false)
    setshowImprovement(true)
  }

  const dismissSuggestionModal = () => {
    navigation.popToTop()
    setshowImprovement(false)
  }

  const rateUs = () => {
    Rate.rate(ratingOptions, (success, errorMessage) => {
      if (success) {
        crashlytics().log("User went to the review page")
      }
      if (errorMessage) {
        crashlytics().recordError(new Error(errorMessage))
      }
    })
  }

  const { LL } = useI18nContext()
  const FEEDBACK_DELAY = 3000
  const transactionsEdges =
    dataAuthed?.me?.defaultAccount?.transactions?.edges ?? undefined
  const CALLBACK_DELAY = 3000
  useEffect(() => {
    if (transactionsEdges?.length) {
      const feedbackTimeout = setTimeout(() => setIsActive(true), FEEDBACK_DELAY)
      return () => {
        clearTimeout(feedbackTimeout)
      }
    }

    const navigateToHomeTimeout = setTimeout(navigation.popToTop, CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [transactionsEdges, navigation])

  const showFeedbackModal = () => {
    return (
      <Modal
        isVisible={IsActive}
        onBackdropPress={dismiss}
        backdropOpacity={0.3}
        backdropColor={colors.grey3}
        avoidKeyboard={true}
      >
        <View style={styles.view}>
          <Text type="h2">Enjoying the app?</Text>
          <View style={styles.buttonContainer}>
            <GaloyPrimaryButton title={LL.common.No()} onPress={dismiss} />
            <GaloyPrimaryButton title={LL.common.yes()} onPress={rateUs} />
          </View>
        </View>
      </Modal>
    )
  }

  const showSuggestionModal = () => {
    return (
      <Modal
        isVisible={showImprovement}
        onBackdropPress={dismissSuggestionModal}
        backdropOpacity={0.3}
        backdropColor={colors.grey3}
      >
        <View style={styles.view}>
          <Text type="h2">
            Thankyou for the feedback, would you like to like to suggest an improvement?
          </Text>
          <View style={styles.field}>
            <TextInput
              style={styles.noteInput}
              onChangeText={(improvement: React.SetStateAction<string>) =>
                setImprovement(improvement)
              }
              value={improvement}
              multiline={true}
              numberOfLines={3}
              autoFocus
            />
          </View>
          <GaloySecondaryButton title={LL.common.submit()} onPress={submitImprovement} />
        </View>
      </Modal>
    )
  }

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
      <View style={styles.Container}>
        <SuccessIconAnimation>
          <GaloyIcon name={"payment-success"} size={128} />
        </SuccessIconAnimation>
        <SuccessTextAnimation>
          <Text {...testProps("Success Text")} style={styles.successText}>
            {LL.SendBitcoinScreen.success()}
          </Text>
        </SuccessTextAnimation>
      </View>
      {IsActive && showFeedbackModal()}
      {showImprovement && showSuggestionModal()}
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  contentContainer: {
    flexGrow: 1,
  },
  successText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  Container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flex: {
    maxHeight: "25%",
    flex: 1,
  },
  view: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
  },
  noteInput: {
    color: colors.black,
  },
  field: {
    padding: 10,
    marginTop: 10,
    backgroundColor: colors.grey5,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonContainer: {
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
}))

export default SendBitcoinSuccessScreen
