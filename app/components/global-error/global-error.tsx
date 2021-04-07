import * as React from "react"
import Toast from "react-native-root-toast";
import { translate } from "../../i18n";
import { palette } from "../../theme/palette";
import { useApolloNetworkStatus } from "../../app"

export const GlobalErrorToast = () => {
  const status = useApolloNetworkStatus();

  // "prices" is a polled query. 
  // filter this to not have the error message being showed 
  // every 5 seconds or so in case of network disruption
  if (status.queryError?.operation?.operationName === "prices") {
    return null
  }

  if (status.queryError?.networkError || status.mutationError?.networkError) {
    Toast.show(translate("common.connectionIssue"), {
      duration: Toast.durations.LONG,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
      position: 160,
      opacity: 1,
      backgroundColor: palette.red,
    })
  }

  return null
}
