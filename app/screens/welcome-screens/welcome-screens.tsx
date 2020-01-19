import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { OnboardingScreen } from "../../components/onboarding"
import { Text } from "../../components/text"
import { StyleSheet, Alert } from "react-native"
import { inject, observer } from "mobx-react"
import functions from "@react-native-firebase/functions"
import { Loader } from "../../components/loader"
import { withNavigation } from "react-navigation"
import { AccountType, CurrencyType, Onboarding } from "../../utils/enum"

export const lightningLogo = require("./LightningBolt.png")
export const galoyLogo = require("./GaloyLogo.png")
export const bitcoinAndLockLogo = require("./BitcoinLockLogo.png")
export const dollarCardATMLogo = require("./DollarCardATMLogo.png")
export const presentLogo = require("./PresentLogo.png")
export const partyPopperLogo = require("./PartyPopperLogo.png")

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
      <OnboardingScreen next="welcomeBank" image={galoyLogo}>
        <Text style={styles.text}>Welcome! Galoy is a new type of app for managing your money</Text>
      </OnboardingScreen>
    </Screen>
  )
}

export const WelcomeBankScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="welcomeBitcoin" image={dollarCardATMLogo}>
        <Text style={styles.text}>It's a digital bank account</Text>
      </OnboardingScreen>
    </Screen>
  )
}

export const WelcomeBitcoinScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="welcomeEarn" image={bitcoinAndLockLogo}>
        <Text style={styles.text}>And a secure Bitcoin wallet too!</Text>
      </OnboardingScreen>
    </Screen>
  )
}


export const WelcomeEarnScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="welcomeFirstSats" image={presentLogo}>
        <Text style={styles.text}>By using Galoy you earn Bitcoin</Text>
      </OnboardingScreen>
    </Screen>
  )
}

export const WelcomeFirstSatsScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="welcomePhoneInput" header="+1,000 sats" image={partyPopperLogo}>
        <Text style={styles.text}>
          You've earned some sats for installing the Galoy app. Sats are small portions of bitcoin.
          Hooray!
        </Text>
      </OnboardingScreen>
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
          <OnboardingScreen action={action} header="Welcome back!" image={partyPopperLogo}>
            <Text style={styles.text}>
              Your wallet is ready.{"\n"}
              Now send us a payment request so we can send your sats.
            </Text>
          </OnboardingScreen>
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
        <OnboardingScreen next="allDone" header={`+ ${balance} sats`} image={lightningLogo}>
          <Text style={styles.text}>
            Success!{"\n"}
            {"\n"}
            You’ve been paid{"\n"}your first reward.
          </Text>
        </OnboardingScreen>
      </Screen>
    )
}))


export const AllDoneScreen = withNavigation(inject("dataStore")(
  ({ navigation, dataStore }) => {
      const action = async () => {
        await dataStore.onboarding.set(Onboarding.walletOnboarded)
        navigation.navigate("primaryStack")
      }

      return (
        <Screen>
          <OnboardingScreen action={action} image={galoyLogo}>
            <Text style={styles.text}>All done here, you're finished setting up a wallet</Text>
          </OnboardingScreen>
        </Screen>
      )
}))