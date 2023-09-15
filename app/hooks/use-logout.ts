import AsyncStorage from "@react-native-async-storage/async-storage"
import { SCHEMA_VERSION_KEY } from "@app/config"
import KeyStoreWrapper from "../utils/storage/secureStorage"
import crashlytics from "@react-native-firebase/crashlytics"
import { logLogout } from "@app/utils/analytics"
import { useCallback } from "react"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { gql } from "@apollo/client"
import { useUserLogoutMutation } from "@app/graphql/generated"

gql`
  mutation userLogout {
    userLogout {
      success
    }
  }
`

const useLogout = () => {
  const { resetState } = usePersistentStateContext()
  const [userLogoutMutation] = useUserLogoutMutation({
    fetchPolicy: "no-cache",
  })

  const logout = useCallback(
    async (stateToDefault = true): Promise<void> => {
      try {
        await userLogoutMutation()

        await AsyncStorage.multiRemove([SCHEMA_VERSION_KEY])
        await KeyStoreWrapper.removeIsBiometricsEnabled()
        await KeyStoreWrapper.removePin()
        await KeyStoreWrapper.removePinAttempts()

        logLogout()
        if (stateToDefault) {
          resetState()
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          crashlytics().recordError(err)
          console.debug({ err }, `error logout`)
        }
      }
    },
    [resetState, userLogoutMutation],
  )

  return {
    logout,
  }
}

export default useLogout
