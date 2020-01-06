import * as React from "react"
import { Screen } from "../../components/screen"
import { Onboarding } from "../../components/onboarding"

export const lightningBolt = require("./LightningBolt.png")


export const WelcomeGaloyScreen = () => {  
  return (
    <Screen>
      <Onboarding text="Welcome! Galoy is a new type of app for managing your money"
                  next="welcomeBitcoin" image={lightningBolt} />
    </Screen>
  )
}

export class WelcomeBitcoinScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="It's a simple, secure Bitcoin wallet" 
                    next="welcomeBank" image={lightningBolt} />
      </Screen>
    )
  }
}

export class WelcomeBankScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="And a digital bank account too" 
                    next="welcomeEarn" image={lightningBolt} />
      </Screen>
    )
  }
}

export class WelcomeEarnScreen extends React.Component<{}, {}> {
  render () {
    return (
      <Screen>
        <Onboarding text="By using Galoy you earn Bitcoin" 
                    next="welcomeFirstSats" image={lightningBolt} />
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
         image={lightningBolt}
         />
      </Screen>
    )
  }
}