import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { Onboarding } from "../../components/onboarding"
import { Text } from "../../components/text"
import { StyleSheet, Alert, Button } from "react-native"
import { inject, observer } from "mobx-react"
import functions from "@react-native-firebase/functions"
import { Loader } from "../../components/loader"
import { withNavigation } from "react-navigation"
import { saveString } from "../../utils/storage"
import { AccountType, CurrencyType } from "../../utils/enum"
import { OnboardingSteps } from "../loading-screen"
import {Notifications, Registered, RegistrationError} from 'react-native-notifications'

export const lightningLogo = require("./LightningBolt.png")
export const galoyLogo = require("./GaloyLogo.png")
export const bitcoinAndLockLogo = require("./BitcoinLockLogo.png")
export const dollarCardATMLogo = require("./DollarCardATMLogo.png")
export const presentLogo = require("./PresentLogo.png")
export const partyPopperLogo = require("./PartyPopperLogo.png")
export const bellLogo = require("./BellLogo.png")

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 40,
  },
})

export const WelcomeGaloyScreen = () => {
  return (
    <Screen>
      <Onboarding next="welcomeBitcoin" image={galoyLogo}>
        <Text style={styles.text}>Welcome! Galoy is a new type of app for managing your money</Text>
      </Onboarding>
    </Screen>
  )
}

export const WelcomeBitcoinScreen = () => {
  return (
    <Screen>
      <Onboarding next="welcomeBank" image={bitcoinAndLockLogo}>
        <Text style={styles.text}>It's a simple, secure Bitcoin wallet</Text>
      </Onboarding>
    </Screen>
  )
}

export const WelcomeBankScreen = () => {
  return (
    <Screen>
      <Onboarding next="welcomeEarn" image={dollarCardATMLogo}>
        <Text style={styles.text}>And a digital bank account too</Text>
      </Onboarding>
    </Screen>
  )
}

export const WelcomeEarnScreen = () => {
  return (
    <Screen>
      <Onboarding next="welcomeFirstSats" image={presentLogo}>
        <Text style={styles.text}>By using Galoy you earn Bitcoin</Text>
      </Onboarding>
    </Screen>
  )
}

export const WelcomeFirstSatsScreen = () => {
  return (
    <Screen>
      <Onboarding next="welcomePhoneInput" header="+1,000 sats" image={partyPopperLogo}>
        <Text style={styles.text}>
          You've earned some sats for installing the Galoy app. Sats are small portions of bitcoin.
          Hooray!
        </Text>
      </Onboarding>
    </Screen>
  )
}

export const WelcomeBackCompletedScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {

      const [loading, setLoading] = useState(false)
      const [err, setErr] = useState("")

      const action = async () => {
        setLoading(true)
        try {
          const response = await dataStore.lnd.addInvoice({
            value: 6000,
            memo: "Claimed Rewards",
          })
          const invoice = response.paymentRequest
          const result = await functions().httpsCallable("payInvoice")({ invoice })
          console.tron.log(invoice, result)
          setLoading(false)
          navigation.navigate("firstReward")
        } catch (err) {
          console.tron.debug(typeof err['message'])
          console.tron.debug(String(err) + String(err[2]))
          setErr(err.toString())
        } 
      }

      useEffect(() => {
        if (err !== "") {
          Alert.alert("error", err, [
            {
              text: "OK",
              onPress: () => {
                setLoading(false)
              },
            },
          ])
          setErr("")
        }
      }, [err])

      return (
        <Screen>
          <Loader loading={loading} />
          <Onboarding action={action} header="Welcome back!" image={partyPopperLogo}>
            <Text style={styles.text}>
              Your wallet is ready.{"\n"}
              Now send us a payment request so we can send your sats.
            </Text>
          </Onboarding>
        </Screen>
      )
    }),
  ),
)

export const FirstRewardScreen = inject("dataStore")(
  observer(({ dataStore }) => {

    const [balance, setBalance] = useState(0)

    useEffect(() => {
      const updateBalance = async () => {
        await dataStore.lnd.updateBalance()
        const result = dataStore.balances({
          currency: CurrencyType.BTC,
          account: AccountType.Bitcoin,
        })
        setBalance(result)
      }
      
      updateBalance()
      const timer = setInterval(updateBalance, 1000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <Screen>
        <Onboarding next="enableNotifications" header={`+ ${balance} sats`} image={lightningLogo}>
          <Text style={styles.text}>
            Success!{"\n"}
            {"\n"}
            You’ve been paid{"\n"}your first reward.
          </Text>
        </Onboarding>
      </Screen>
    )
}))

export const EnableNotificationsScreen = () => {
  // TODO

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

  return (
    <Screen>
      <Onboarding next="allDone" image={bellLogo}>
        <Text style={styles.text}>
          Enable notifications to get alerts when you receive payments in the future.
        </Text>
      </Onboarding>
      <Button title="enable" onPress={() => Notifications.registerRemoteNotifications()} />
    </Screen>
  )
}

export const AllDoneScreen = withNavigation(
  (({ navigation }) => {
      const action = async () => {
        await saveString("onboarding", OnboardingSteps.onboarded)
        navigation.navigate("primaryStack")
      }

      return (
        <Screen>
          <Onboarding action={action} image={galoyLogo}>
            <Text style={styles.text}>All done here, you're finished setting up a wallet</Text>
          </Onboarding>
        </Screen>
      )
  }),
)
