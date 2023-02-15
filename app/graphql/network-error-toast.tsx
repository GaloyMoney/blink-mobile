import { ServerError } from "@apollo/client"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { toastShow } from "@app/utils/toast"
import React from "react"
import { NetworkErrorCode } from "./error-code"

export const NetworkErrorToast: React.FC<{ networkError: ServerError | undefined }> = ({
  networkError,
}) => {
  const { LL } = useI18nContext()
  const { logout } = useLogout()

  React.useEffect(() => {
    if (!networkError) {
      return
    }

    if (networkError.statusCode >= 500) {
      // TODO translation
      toastShow({
        message: (translations) => translations.errors.network.server(),
        currentTranslation: LL,
      })
    }

    if (networkError.statusCode >= 400 && networkError.statusCode < 500) {
      let errorCode = networkError.result?.errors?.[0]?.code

      if (!errorCode) {
        switch (networkError.statusCode) {
          case 401:
            errorCode = "INVALID_AUTHENTICATION"
            break
        }
      }

      switch (errorCode) {
        case NetworkErrorCode.InvalidAuthentication:
          toastShow({
            message: (translations) => translations.common.reauth(),
            onHide: logout,
            currentTranslation: LL,
          })
          break

        default:
          // TODO translation
          toastShow({
            message: (translations) => translations.errors.network.request(),
            currentTranslation: LL,
          })
          break
      }
    }

    if (networkError.message === "Network request failed") {
      // TODO translation
      toastShow({
        message: (translations) => translations.errors.network.connection(),
        currentTranslation: LL,
      })
    }
  }, [networkError, LL, logout])

  return <></>
}
