import * as React from "react"
import {Notifications, Registered, RegistrationError} from 'react-native-notifications'
import { Alert, Text, Button } from "react-native"
import functions from "@react-native-firebase/functions"
import { Screen } from "../../components/screen"
import { Onboarding } from "../../components/onboarding"

export const bellLogo = require("./BellLogo.png")


Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
    Alert.alert("Registered For Remote Push", `Device Token: ${event.deviceToken}`)
  
    try {
      await functions().httpsCallable("sendDeviceToken")({deviceToken: event.deviceToken})
    } catch (err) {
      console.tron.log(err.toString())
      Alert.alert(err.toString())
    }
})
  

Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
    Alert.alert("Failed To Register For Remote Push", `Error (${event})`)
})


export const EnableNotificationsScreen = () => {

    return (
        <Screen>
            <Button title="enable" onPress={() => Notifications.registerRemoteNotifications()} />
            <Onboarding next="allDone" image={bellLogo}>
                <Text>
                Enable notifications to get alerts when you receive payments in the future.
                </Text>
            </Onboarding>
        </Screen>
)}
  