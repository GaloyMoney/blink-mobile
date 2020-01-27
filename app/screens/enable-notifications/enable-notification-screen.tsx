import * as React from "react"
import { useState, useEffect } from "react"
import {Notifications, Registered, RegistrationError} from 'react-native-notifications'
import { Alert, Text, StyleSheet } from "react-native"
import functions from "@react-native-firebase/functions"
import { Screen } from "../../components/screen"
import { OnboardingScreen } from "../../components/onboarding"
import { inject } from "mobx-react"
import { useNavigation } from "react-navigation-hooks"
import { Onboarding } from "../../../../common/types"

export const bellLogo = require("./BellLogo.png")

const styles = StyleSheet.create({
    text: {
      fontSize: 18,
      textAlign: "center",
      paddingHorizontal: 40,
      paddingVertical: 20,
    },
})

export const EnableNotificationsScreen = inject("dataStore")(
    ({ dataStore }) => {

    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")

    const { goBack } = useNavigation()

    Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
        console.tron.log("Registered For Remote Push", `Device Token: ${event.deviceToken}`)

        try {
            setLoading(true)
            await functions().httpsCallable("sendDeviceToken")({deviceToken: event.deviceToken})
            await dataStore.onboarding.add(Onboarding.activateNotifications)
            setLoading(false)
            goBack(null)
        } catch (err) {
            console.tron.log(err.toString())
            setErr(err.toString())
        }
    })
    
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
        Alert.alert("Failed To Register For Remote Push", `Error (${event})`)
    })
    
    useEffect(() => {
      if (err !== "") {
        setErr("")
        Alert.alert("error", err, [
          {
            text: "OK",
            onPress: () => {
              setLoading(false)
            },
          },
        ])
      }
    }, [err])

    return (
        <Screen>
          <OnboardingScreen nextTitle="Activate" loading={loading}
              action={() => Notifications.registerRemoteNotifications()} image={bellLogo}>
              <Text style={styles.text}>
              Enable notifications to get alerts when you receive payments in the future.
              {'\n'}{'\n'}
              Get +1,000 sats
              </Text>
          </OnboardingScreen>
        </Screen>
)})

EnableNotificationsScreen.navigationOptions = () => ({
    title: "Enable Notifications"
})
