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

export const getAppCheckToken = async (): Promise<string | undefined> => {
  try {
    const result = await appCheck().getToken()
    const token = result.token
    return token
  } catch (err) {
    console.log("getDeviceToken error", err)
    return undefined
  }
}

const useAppCheckToken = ({
  skip = false,
}: {
  skip: boolean
}): [string | undefined, boolean] => {
  const [token, setToken] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (skip) {
      return
    }

    ;(async () => {
      setLoading(true)
      const result = await getAppCheckToken()
      setToken(result)
      setLoading(false)
    })()
  }, [skip])

  return [token, loading]
}

export default useAppCheckToken
