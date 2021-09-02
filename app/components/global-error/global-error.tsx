import { ServerError, ServerParseError } from "@apollo/client"
import { useApolloNetworkStatus } from "../../app"
import { ComponentType } from "../../types/jsx"
import { toastShow } from "../../utils/toast"

export const GlobalErrorToast: ComponentType = () => {
  const status = useApolloNetworkStatus()

  console.log({ status }, "status query")

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
    toastShow("Server Error. Please try again later")
  }

  if (networkError.statusCode >= 400 && networkError.statusCode < 500) {
    // TODO translation
    toastShow("Request issue.\nContact support if the problem persists")
  }

  if (networkError.message === "Network request failed") {
    // TODO translation
    toastShow("Connection issue.\nVerify your internet connection")
  }

  if (status.mutationError) {
    status.mutationError.networkError = null
  }

  if (status.queryError) {
    status.queryError.networkError = null
  }

  return null
}
