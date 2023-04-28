import { useState, useEffect } from "react"
import appCheck from "@react-native-firebase/app-check"

const useDeviceToken = ({
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

    const tryGetDeviceToken = async (): Promise<void> => {
      setLoading(true)
      const DEV = true
      const debugTokenAndroid = `6AED0F8B-51EE-41BD-B6C7-0D34D78E94BC`
      const debugTokenIOS = ``

      const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider()
      rnfbProvider.configure({
        android: {
          provider: DEV ? "debug" : "playIntegrity",
          debugToken: debugTokenAndroid,
        },
        apple: {
          provider: "appAttestWithDeviceCheckFallback",
        },
        web: {
          provider: "reCaptchaV3",
          siteKey: "unknown",
        },
      })

      await appCheck().initializeAppCheck({
        provider: rnfbProvider,
      })

      try {
        const result = await appCheck().getToken(true)
        const token = result.token
        console.log("App Check token: ", token)
        setToken(token)
        setLoading(false)
      } catch (err) {
        console.log("ERROR App Check token: ", err)
        setLoading(false)
      }
    }

    tryGetDeviceToken()
  }, [skip])

  return [token, loading]
}

export default useDeviceToken
