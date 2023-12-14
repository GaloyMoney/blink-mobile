import React, { useCallback, useEffect } from "react"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { Screen } from "@app/components/screen"
import {
  SuccessIconAnimation,
  SuccessTextAnimation,
} from "@app/components/success-animation"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text } from "@rneui/themed"
import { View, Alert } from "react-native"
import { testProps } from "../../utils/testProps"
import { useApolloClient } from "@apollo/client"
import { useFeedbackModalShownQuery } from "@app/graphql/generated"
import { setFeedbackModalShown } from "@app/graphql/client-only-query"
import { SuggestionModal } from "./suggestion-modal"
import { logAppFeedback } from "@app/utils/analytics"
import InAppReview from "react-native-in-app-review"
import { formatTimeToMempool } from "../transaction-detail-screen/format-time"

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinSuccess">
}

const SendBitcoinSuccessScreen: React.FC<Props> = ({ route }) => {
  const extraInfo = route.params.extraInfo
  const styles = useStyles()
  const [showSuggestionModal, setShowSuggestionModal] = React.useState(false)
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinSuccess">>()

  const client = useApolloClient()
  const feedbackShownData = useFeedbackModalShownQuery()
  const feedbackModalShown = feedbackShownData?.data?.feedbackModalShown
  const { LL, locale } = useI18nContext()

  const iDontEnjoyTheApp = () => {
    logAppFeedback({
      isEnjoingApp: false,
    })
    setShowSuggestionModal(true)
  }

  const iEnjoyTheApp = () => {
    logAppFeedback({
      isEnjoingApp: true,
    })
    InAppReview.RequestInAppReview()
  }

  const requestFeedback = useCallback(() => {
    if (InAppReview.isAvailable()) {
      Alert.alert(
        "",
        LL.support.enjoyingApp(),
        [
          {
            text: LL.common.No(),
            onPress: () => iDontEnjoyTheApp(),
          },
          {
            text: LL.common.yes(),
            onPress: () => iEnjoyTheApp(),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {},
        },
      )
      setFeedbackModalShown(client, true)
    }
  }, [LL, client])

  const FEEDBACK_DELAY = 3000
  const CALLBACK_DELAY = 3000
  useEffect(() => {
    if (!feedbackModalShown) {
      const feedbackTimeout = setTimeout(() => {
        requestFeedback()
      }, FEEDBACK_DELAY)
      return () => {
        clearTimeout(feedbackTimeout)
      }
    }
    if (!showSuggestionModal) {
      const navigateToHomeTimeout = setTimeout(navigation.popToTop, CALLBACK_DELAY)
      return () => clearTimeout(navigateToHomeTimeout)
    }
  }, [client, feedbackModalShown, LL, showSuggestionModal, navigation, requestFeedback])

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
        {extraInfo?.arrivalAtMempoolEstimate && (
          <SuccessTextAnimation>
            <Text {...testProps("Success Text")} style={styles.successText}>
              {LL.SendBitcoinScreen.willBeSentToMempoolBy()}
              {"\n"}
              {formatTimeToMempool(extraInfo.arrivalAtMempoolEstimate, LL, locale)}
            </Text>
          </SuccessTextAnimation>
        )}
      </View>
      <SuggestionModal
        navigation={navigation}
        showSuggestionModal={showSuggestionModal}
        setShowSuggestionModal={setShowSuggestionModal}
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
