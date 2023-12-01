import { useState, useEffect } from "react"
import appCheck from "@react-native-firebase/app-check"
import Config from "react-native-config"

const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider()
rnfbProvider.configure({
  android: {
    provider: __DEV__ ? "debug" : "playIntegrity",
    debugToken: Config.APP_CHECK_ANDROID_DEBUG_TOKEN,
  },
  apple: {
    provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
    debugToken: Config.APP_CHECK_IOS_DEBUG_TOKEN,
  },
})

appCheck().initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: true })

const useAppCheckToken = ({ skip = false }: { skip?: boolean }): string | undefined => {
  const [appCheckToken, setAppCheckToken] = useState<string | undefined>(undefined)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (skip) return
      if (hasInitialized) return
      try {
        setHasInitialized(true)
        const result = await appCheck().getToken()
        setAppCheckToken(result.token)
      } catch (err) {
        console.log("getDeviceToken error", err)
      }
    })()
  }, [skip, setHasInitialized, hasInitialized])

  return appCheckToken
}

export default useAppCheckToken
