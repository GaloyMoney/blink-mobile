import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import appCheck from "@react-native-firebase/app-check"
import { useAppConfig } from "@app/hooks"
import analytics from "@react-native-firebase/analytics"

import {
  useNetworkQuery,
  useUserDeviceAccountCreateMutation,
} from "@app/graphql/generated"
import { useLevel } from "@app/graphql/level-context"
import { testProps } from "@app/utils/testProps"
import { useNavigation } from "@react-navigation/native"
import { Button, Text } from "@rneui/themed"
import { sleep } from "@app/utils/sleep"
import { gql } from "@apollo/client"

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonTitle: {
    color: palette.white,
    fontWeight: "bold",
  },

  screen: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
})

gql`
  mutation userDeviceAccountCreate {
    userDeviceAccountCreate {
      success
      errors {
        message
      }
    }
  }
`

export const SetUpLiteDeviceAccountScreen = () => {
  const { saveToken } = useAppConfig()
  const { data: dataNetwork } = useNetworkQuery()
  const network = dataNetwork?.globals?.network
  const [userDeviceAccountCreate] = useUserDeviceAccountCreateMutation({
    fetchPolicy: "no-cache",
  })

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const { LL } = useI18nContext()

  const { isAtLeaseLevelZero } = useLevel()

  // TODO this function need to be tests (maybe as an independent hook?)
  React.useEffect(() => {
    ;(async () => {
      // TODO: remove once feature is completed.
      // This is a temporary measure to prevent ddos our backend
      if (!network || network === "mainnet") {
        return
      }

      if (!userDeviceAccountCreate || !saveToken || isAtLeaseLevelZero) {
        return
      }

      const DEV = true

      const debugTokenAndroid = `6AED0F8B-51EE-41BD-B6C7-0D34D78E94BC`
      const debugTokenIOS = ``
      console.log({ debugTokenIOS })

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

      let token: string

      try {
        const result = await appCheck().getToken(true)
        token = result.token
        console.log("App Check token: ", token)
      } catch (err) {
        console.log("ERROR App Check token: ", err)
        return
      }

      appCheck().setTokenAutoRefreshEnabled(true)

      saveToken(token)
      await sleep(100)

      const { data } = await userDeviceAccountCreate()
      console.log({ data, token })

      if (data?.userDeviceAccountCreate.success) {
        analytics().logLogin({ method: "device" })
      } else {
        saveToken("")
        console.error(
          data?.userDeviceAccountCreate.errors,
          "error creating userDeviceAccount",
        )
      }
    })()
  }, [userDeviceAccountCreate, saveToken, isAtLeaseLevelZero, network])

  return (
    <Screen style={styles.screen}>
      <View style={styles.bottom}>
        {isAtLeaseLevelZero ? (
          <Text>
            {
              "your lite account is ready.\n\nKeep in mind this lite account doesn't have backup\n\nPlease register to a full account whenever convenient so you don't loose your money if you loose your phone"
            }
          </Text>
        ) : (
          <Text>{"Creating your lite account..."}</Text>
        )}

        <Button
          title={LL.common.ok()}
          titleStyle={styles.buttonTitle}
          onPress={() => navigation.replace("Primary")}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.startLiteAccount())}
        />
      </View>
    </Screen>
  )
}

// ChatGPT code to handle the token refresh
// should be in client.tsx or a file that is always load, not like this component
// that is only part of the onboarding flow

// Set an interval to periodically check the token
// let previousToken = null
// const tokenCheckInterval = setInterval(async () => {
//   try {
//     const currentToken = await appCheck.getToken(/* forceRefresh= */ false)
//     if (previousToken && previousToken.token !== currentToken.token) {
//       console.log("Token refreshed:", currentToken.token)

//       // Perform your desired action here, e.g., call your custom callback
//       onTokenRefreshed(currentToken.token)
//     }
//     previousToken = currentToken
//   } catch (error) {
//     console.error("Error getting App Check token:", error)
//   }
// }, 60000) // Check every 60 seconds

// // Custom callback function
// function onTokenRefreshed(newToken) {
//   console.log("New token received:", newToken)
//   // Your custom logic goes here
// }
