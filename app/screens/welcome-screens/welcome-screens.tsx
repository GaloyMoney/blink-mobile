import * as React from "react"
import { Screen } from "../../components/screen"
import { Onboarding } from "../../components/onboarding"

export class WelcomeGaloyScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="Welcome! Galoy is a new type of app for managing your money" next="welcomeBitcoin" />
      </Screen>
    )
  }
}

export class WelcomeBitcoinScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="It's a simple, secure Bitcoin wallet" next="welcomeBank" />
      </Screen>
    )
  }
}

export class WelcomeBankScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="And a digital bank account too" next="welcomeEarn" />
      </Screen>
    )
  }
}

export class WelcomeEarnScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="By using Galoy you earn Bitcoin" next="welcomeFirstSats" />
      </Screen>
    )
  }
}

export class WelcomeFirstSatsScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="You've earned some sats for installing the Galoy app. Sats are small portions of bitcoin. Hooray!"
         next="welcomePhoneInput"
         header="+1,000 sats"
         />
      </Screen>
    )
  }
}
