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
import { makeStyles, Text } from "@rneui/themed"
import { View, Alert } from "react-native"
import { testProps } from "../../utils/testProps"
import Rate from "react-native-rate"
import { ratingOptions } from "@app/config"
import crashlytics from "@react-native-firebase/crashlytics"
import { useApolloClient } from "@apollo/client"
import { useFeedbackModalShownQuery } from "@app/graphql/generated"
import { setFeedbackModalShown } from "@app/graphql/client-only-query"
import { SuggestionModal } from "./suggestion-modal"
import { logAppFeedback } from "@app/utils/analytics"

const SendBitcoinSuccessScreen = () => {
  const styles = useStyles()
  const [isFeedbackModalActive, setIsFeedbackModalActive] = React.useState(false)

  const [showImprovement, setShowImprovement] = React.useState(false)
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinSuccess">>()

  const client = useApolloClient()
  const feedbackShownData = useFeedbackModalShownQuery()
  const modalShown = feedbackShownData?.data?.feedbackModalShown

  const dismiss = () => {
    logAppFeedback({
      isEnjoingApp: false,
    })
    setIsFeedbackModalActive(false)
    setShowImprovement(true)
  }

  const rateUs = () => {
    logAppFeedback({
      isEnjoingApp: true,
    })
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
  const CALLBACK_DELAY = 3000
  useEffect(() => {
    if (!modalShown) {
      const feedbackTimeout = setTimeout(
        () => setIsFeedbackModalActive(true),
        FEEDBACK_DELAY,
      )
      return () => {
        clearTimeout(feedbackTimeout)
        setFeedbackModalShown(client, true)
      }
    }

    const navigateToHomeTimeout = setTimeout(navigation.popToTop, CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [client, modalShown, navigation])

  useEffect(() => {
    if (isFeedbackModalActive) {
      Alert.alert("", LL.support.enjoyingApp(), [
        {
          text: LL.common.No(),
          onPress: () => dismiss(),
        },
        {
          text: LL.common.yes(),
          onPress: () => rateUs(),
        },
      ])
    }
  }, [isFeedbackModalActive, LL])

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
      <SuggestionModal
        navigation={navigation}
        showSuggestionModal={showImprovement}
        setShowSuggestionModal={setShowImprovement}
      />
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
  view: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
  },
}))

export default SendBitcoinSuccessScreen
