import * as React from "react"
import { Screen } from "../../components/screen"
import { PhoneInit, PhoneVerif } from "../../components/phone"

export const WelcomePhoneInputScreen = () => {
  return (
    <Screen>
      <PhoneInit 
      header="To receive your sats, first we need to activate your Bitcoin wallet." 
      text="This will take a little while, but we’ll send you a text you when it’s ready!" 
      next="welcomePhoneValidation" 
      />
    </Screen>
  )
}

export const WelcomePhoneValidationScreen = () => {
  return (
    <Screen>
      <PhoneVerif
      text="To confirm your phone number, enter the code we just sent you." 
      next="welcomeSyncing" 
      />
    </Screen>
  )
}