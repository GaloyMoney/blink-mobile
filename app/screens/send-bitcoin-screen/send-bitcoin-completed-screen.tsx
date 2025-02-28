import React, { useCallback, useEffect } from "react"
import { utils } from "lnurl-pay"
import { View, Alert, TouchableOpacity, Linking } from "react-native"
import InAppReview from "react-native-in-app-review"
import Clipboard from "@react-native-clipboard/clipboard"

import { useApolloClient } from "@apollo/client"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { Screen } from "@app/components/screen"
import { toastShow } from "@app/utils/toast"
import {
  SuccessIconAnimation,
  CompletedTextAnimation,
} from "@app/components/success-animation"
import { setFeedbackModalShown } from "@app/graphql/client-only-query"
import { useFeedbackModalShownQuery } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { logAppFeedback } from "@app/utils/analytics"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { testProps } from "../../utils/testProps"
import {
  formatTimeToMempool,
  timeToMempool,
} from "../transaction-detail-screen/format-time"
import { SuggestionModal } from "./suggestion-modal"
import { PaymentSendCompletedStatus } from "./use-send-payment"

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinCompleted">
}

// TODO: proper type from the backend so we don't need this processing in the front end
// ie: it should return QUEUED for an onchain send payment
type StatusProcessed = "SUCCESS" | "PENDING" | "QUEUED"

const SendBitcoinCompletedScreen: React.FC<Props> = ({ route }) => {
  const {
    arrivalAtMempoolEstimate,
    status: statusRaw,
    successAction,
    preimage,
  } = route.params
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const status = processStatus({ arrivalAtMempoolEstimate, status: statusRaw })

  const [showSuggestionModal, setShowSuggestionModal] = React.useState(false)
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinCompleted">>()

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

  const { appConfig } = useAppConfig()

  const requestFeedback = useCallback(() => {
    if (!appConfig || appConfig.galoyInstance.id === "Local") {
      return
    }

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
  }, [LL, client, appConfig])

  const FEEDBACK_DELAY = 3000
  useEffect(() => {
    if (!feedbackModalShown) {
      const feedbackTimeout = setTimeout(() => {
        requestFeedback()
      }, FEEDBACK_DELAY)
      return () => {
        clearTimeout(feedbackTimeout)
      }
    }
  }, [client, feedbackModalShown, LL, requestFeedback])

  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text)
    toastShow({
      type: "success",
      message,
      LL,
    })
  }

  const SuccessActionComponent = () => {
    if (!successAction) return null

    const { tag, message, description, url } = successAction
    let decryptedMessage = null

    if (tag === "aes" && preimage) {
      decryptedMessage = utils.decipherAES({
        successAction,
        preimage,
      })
    }

    switch (tag) {
      case "message":
        return message ? (
          <View style={styles.successActionContainer}>
            <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>

            <View style={styles.successActionFieldContainer}>
              <View style={styles.disabledFieldBackground}>
                <Text style={styles.truncatedText}>{message}</Text>
              </View>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() =>
                  copyToClipboard(message, LL.SendBitcoinScreen.copiedSuccessMessage())
                }
                accessibilityLabel={LL.SendBitcoinScreen.copySuccessMessage()}
                hitSlop={30}
              >
                <GaloyIcon name={"copy-paste"} size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null
      case "url":
        return (
          <>
            <View style={styles.successActionContainer}>
              {description && description.length > 0 && (
                <View>
                  <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>
                  <View style={styles.successActionFieldContainer}>
                    <View style={styles.disabledFieldBackground}>
                      <Text style={styles.truncatedText}>{description}</Text>
                    </View>
                    <View style={styles.iconActionsContainer}>
                      <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() =>
                          copyToClipboard(
                            description!,
                            LL.SendBitcoinScreen.copiedSuccessMessage(),
                          )
                        }
                        accessibilityLabel={LL.SendBitcoinScreen.copySuccessMessage()}
                        hitSlop={styles.hitSlopIcon}
                      >
                        <GaloyIcon name="copy-paste" size={25} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.copyUrlButton}
                onPress={() => Linking.openURL(url!)}
                accessibilityLabel={LL.SendBitcoinScreen.openSuccessUrl()}
                hitSlop={styles.hitSlopIcon}
              >
                <Text style={styles.copyUrlButtonText}>
                  {LL.ScanningQRCodeScreen.openLinkTitle()}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )
      case "aes":
        return decryptedMessage ? (
          <View style={styles.successActionContainer}>
            <Text style={styles.fieldTitleText}>{LL.SendBitcoinScreen.note()}</Text>

            {description && description?.length > 0 && (
              <View style={styles.successActionFieldContainer}>
                <View style={styles.disabledFieldBackground}>
                  <Text style={styles.truncatedText}>{description}</Text>
                </View>
              </View>
            )}
            <View style={styles.successActionFieldContainer}>
              <View style={styles.disabledFieldBackground}>
                <Text style={styles.truncatedText}>{decryptedMessage}</Text>
              </View>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() =>
                  copyToClipboard(
                    decryptedMessage,
                    LL.SendBitcoinScreen.copiedSecretMessage(),
                  )
                }
                accessibilityLabel={LL.SendBitcoinScreen.copySecretMessage()}
                hitSlop={30}
              >
                <GaloyIcon name={"copy-paste"} size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null
      default:
        return null
    }
  }

  const MainIcon = () => {
    switch (status) {
      case "SUCCESS":
        return <GaloyIcon name={"payment-success"} size={128} />
      case "QUEUED":
        return <GaloyIcon name={"payment-pending"} size={128} />
      case "PENDING":
        return <GaloyIcon name={"warning"} color={colors._orange} size={128} />
    }
  }

  const SuccessText = () => {
    switch (status) {
      case "SUCCESS":
        return LL.SendBitcoinScreen.success()
      case "QUEUED":
        return LL.TransactionDetailScreen.txNotBroadcast({
          countdown: formatTimeToMempool(
            timeToMempool(arrivalAtMempoolEstimate as number),
            LL,
            locale,
          ),
        })
      case "PENDING":
        return LL.SendBitcoinScreen.pendingPayment()
    }
  }

  return (
    <Screen preset="scroll" style={styles.contentContainer}>
      <View style={styles.Container}>
        <SuccessIconAnimation>{MainIcon()}</SuccessIconAnimation>
        <CompletedTextAnimation>
          <Text {...testProps("Success Text")} style={styles.completedText} type="h2">
            {SuccessText()}
          </Text>
        </CompletedTextAnimation>
        <SuccessActionComponent />
      </View>
      <SuggestionModal
        navigation={navigation}
        showSuggestionModal={showSuggestionModal}
        setShowSuggestionModal={setShowSuggestionModal}
      />
    </Screen>
  )
}

const processStatus = ({
  status,
  arrivalAtMempoolEstimate,
}: {
  status: PaymentSendCompletedStatus
  arrivalAtMempoolEstimate: number | undefined
}): StatusProcessed => {
  if (status === "SUCCESS") {
    return "SUCCESS"
  }

  if (arrivalAtMempoolEstimate) {
    return "QUEUED"
  }
  return "PENDING"
}

const useStyles = makeStyles(({ colors }) => ({
  contentContainer: {
    flexGrow: 1,
  },
  completedText: {
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 28,
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
  truncatedText: {
    fontSize: 14,
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  successActionContainer: {
    minWidth: "100%",
    paddingHorizontal: 40,
    marginTop: 30,
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.primary,
  },
  successActionFieldContainer: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    alignItems: "center",
    padding: 14,
    minHeight: 60,
    marginBottom: 12,
  },
  disabledFieldBackground: {
    flex: 1,
    opacity: 0.5,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  hitSlopIcon: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  iconActionsContainer: {
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },
  copyUrlButton: {
    backgroundColor: colors.grey5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  copyUrlButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
}))

export default SendBitcoinCompletedScreen
