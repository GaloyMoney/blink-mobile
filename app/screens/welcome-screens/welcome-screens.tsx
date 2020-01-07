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

export const WelcomeBitcoinScreen = () => {
    return (
      <Screen>
        <Onboarding text="It's a simple, secure Bitcoin wallet" 
                    next="welcomeBank" image={lightningBolt} />
      </Screen>
    )
}

export const WelcomeBankScreen = () => {
    return (
      <Screen>
        <Onboarding text="And a digital bank account too" 
                    next="welcomeEarn" image={lightningBolt} />
      </Screen>
    )
}

export const WelcomeEarnScreen = () => {
    return (
      <Screen>
        <Onboarding text="By using Galoy you earn Bitcoin" 
                    next="welcomeFirstSats" image={lightningBolt} />
      </Screen>
    )
}

export const WelcomeFirstSatsScreen = () => {
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

export const WelcomeBackScreen = () => {
    return (
      <Screen>
        <Onboarding text="Your wallet is ready.{'\n'}
Now send us a payment request so we can send your sats."
         next="firstReward"
         header="+1,000 sats"
         image={lightningBolt}
         />
      </Screen>
    )
}

export const FirstRewardScreen = () => {
    return (
      <Screen>
        <Onboarding text="Success!{'\n'}
You’ve been paid your first reward."
         next="firstReward"
         header="+1,000 sats"
         image={lightningBolt}
         />
      </Screen>
    )
}
