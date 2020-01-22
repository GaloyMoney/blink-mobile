import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { OnboardingScreen } from "../../components/onboarding"
import { Text } from "../../components/text"
import { StyleSheet, Alert } from "react-native"
import { inject, observer } from "mobx-react"
import { withNavigation } from "react-navigation"
import { AccountType, CurrencyType, Onboarding } from "../../utils/enum"
import { GetReward } from "../../components/rewards"
import { trophyLogo } from "../rewards-screen"
import { Loader } from "../../components/loader"

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
        <Text style={styles.text}>Welcome!{'\n'}{'\n'}Galoy is a new type of financial app</Text>
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
        <Text style={styles.text}>By using Galoy, you earn bitcoin.</Text>
      </OnboardingScreen>
    </Screen>
  )
}

export const WelcomeFirstSatsScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="welcomePhoneInput" header="+5,000 sats" image={trophyLogo}>
        <Text style={styles.text}>
          Hooray!{'\n'}{'\n'}
          You've earned some sats for installing the Galoy app.
          {'\n'}{'\n'}Sats are small portions of bitcoin.
        </Text>
      </OnboardingScreen>
    </Screen>
  )
}


export const WelcomeBackCompletedScreen = withNavigation(inject("dataStore")(observer(
  ({ dataStore, navigation }) => {

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const onGetReward = async () => {

    try {
      setLoading(true)
      await GetReward({
        value: 5000,
        memo: "App download rewards",
        lnd: dataStore.lnd,
        setErr,
      })
      dataStore.onboarding.set(Onboarding.walletOnboarded)
      navigation.navigate("firstReward")
      setLoading(false)
    } catch (err) {
      console.tron.error(err)
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
      <OnboardingScreen action={onGetReward} header="Welcome back!" image={partyPopperLogo}>
        <Text style={styles.text}>
          Your wallet is ready.{"\n"}
          Now send us a payment request so we can send your sats.
        </Text>
      </OnboardingScreen>
    </Screen>
  )
})))

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


export const AllDoneScreen = () => {
  return (
    <Screen>
      <OnboardingScreen next="primaryStack" image={galoyLogo}>
        <Text style={styles.text}>All done here, you've finished setting up a wallet</Text>
      </OnboardingScreen>
    </Screen>
)}
