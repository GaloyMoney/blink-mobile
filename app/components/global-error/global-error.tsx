import { ServerError, ServerParseError } from "@apollo/client"
import { useApolloNetworkStatus } from "../../app"
import { ComponentType } from "../../types/jsx"
import { NetworkErrorCode } from "./network-error-code"
import { toastShow } from "@app/utils/toast"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useEffect } from "react"

export const GlobalErrorToast: ComponentType = () => {
  const status = useApolloNetworkStatus()
  // use logout hook
  const { logout } = useLogout()
  const { LL } = useI18nContext()

  useEffect(() => {
    // "prices" is a polled query.
    // filter this to not have the error message being showed
    // every 5 seconds or so in case of network disruption
    if (status.queryError?.operation?.operationName === "prices") {
      return
    }

    const networkError = (status.queryError || status.mutationError)?.networkError as
      | ServerError
      | ServerParseError

    if (!networkError) {
      return
    }

    if (networkError.statusCode >= 500) {
      // TODO translation
      toastShow({ message: LL.errors.network.server() })
    }

    if (networkError.statusCode >= 400 && networkError.statusCode < 500) {
      let errorCode = (networkError as ServerError).result?.errors?.[0]?.code

      if (!errorCode) {
        switch (networkError.statusCode) {
          case 401:
            errorCode = "INVALID_AUTHENTICATION"
            break
        }
      }

      switch (errorCode) {
        case NetworkErrorCode.InvalidAuthentication:
          toastShow({ message: LL.common.reauth(), _onHide: () => logout() })
          break

        default:
          // TODO translation
          toastShow({ message: LL.errors.network.request() })
          break
      }
    }

    if (networkError.message === "Network request failed") {
      // TODO translation
      toastShow({ message: LL.errors.network.connection() })
    }

    if (status.mutationError) {
      status.mutationError.networkError = null
    }

    if (status.queryError) {
      status.queryError.networkError = null
    }
  })

  return null
}
