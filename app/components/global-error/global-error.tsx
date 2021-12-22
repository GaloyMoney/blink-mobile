import { ServerError, ServerParseError } from "@apollo/client"
import { useApolloNetworkStatus } from "../../app"
import { ComponentType } from "../../types/jsx"
import { toastShow } from "../../utils/toast"
import { NetworkErrorCode } from "./network-error-code"
import useLogout from "../../hooks/use-logout"
import { translate } from "../../i18n"
import Toast from "react-native-root-toast"
import { setJSExceptionHandler } from "react-native-exception-handler"
import { Alert } from "react-native"
import crashlytics from "@react-native-firebase/crashlytics"
import RNRestart from "react-native-restart"
import { openWhatsApp } from "../../utils/external"
import { WHATSAPP_CONTACT_NUMBER } from "../../constants/support"

setJSExceptionHandler((e) => {
  crashlytics().log("Caught a fatal javascript error.")
  crashlytics().recordError(e)
  Alert.alert(
    translate("errors.unexpectedError"),
    `
${translate("common.error")}: ${e.name}

${translate("errors.restartApp")}

${translate("errors.problemPersists")}
        `,
    [
      {
        text: translate("common.restart"),
        onPress: () => {
          RNRestart.Restart()
        },
      },
      {
        text: translate("whatsapp.contactSupport"),
        onPress: () => {
          openWhatsApp(
            WHATSAPP_CONTACT_NUMBER,
            translate("whatsapp.defaultSupportMessage"),
          )
        },
      },
    ],
  )
})

export const GlobalErrorToast: ComponentType = () => {
  const status = useApolloNetworkStatus()
  const { logout } = useLogout()

  // "prices" is a polled query.
  // filter this to not have the error message being showed
  // every 5 seconds or so in case of network disruption
  if (status.queryError?.operation?.operationName === "prices") {
    return null
  }

  const networkError = (status.queryError || status.mutationError)?.networkError as
    | ServerError
    | ServerParseError

  if (!networkError) {
    return null
  }

  if (networkError.statusCode >= 500) {
    // TODO translation
    toastShow(translate("errors.network.server"))
  }

  if (networkError.statusCode >= 400 && networkError.statusCode < 500) {
    const errorCode = (networkError as ServerError).result?.errors?.[0]?.code
    switch (errorCode) {
      case NetworkErrorCode.InvalidAuthentication:
        toastShow(translate("common.loggedOut"), {
          duration: Toast.durations.SHORT,
          onHidden: () => logout(),
        })
        break

      default:
        // TODO translation
        toastShow(translate("errors.network.request"))
        break
    }
  }

  if (networkError.message === "Network request failed") {
    // TODO translation
    toastShow(translate("errors.network.connection"))
  }

  if (status.mutationError) {
    status.mutationError.networkError = null
  }

  if (status.queryError) {
    status.queryError.networkError = null
  }

  return null
}
