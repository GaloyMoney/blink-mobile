import * as React from "react"
import { Screen } from "../../components/screen"
import { OnboardingScreen } from "../../components/onboarding"
import { Text } from "../../components/text"
import { inject } from "mobx-react"
import { useNavigation } from "react-navigation-hooks"
import { Onboarding } from "types"
import { StyleSheet } from "react-native"

import { color } from "../../theme"


import Swiper from 'react-native-swiper'
import { translate } from "../../i18n"

const bitcoinLogo = require("./BitcoinLogo.png")
const dollarLogo = require("./DollarLogo.png")
const presentLogo = require("./PresentLogo.png")


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  image: {
    alignSelf: "center",
    padding: 20,
    height: 90,
    resizeMode: 'center',
  },

  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 40,
    paddingBottom: 10,
  },

  phoneEntryContainer: {
    borderColor: color.palette.darkGrey,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 60,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  textEntry: {
    fontSize: 20,
    color: color.palette.darkGrey,
  },

  buttonContainer: {
    paddingHorizontal: 80,
    paddingVertical: 10,
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },

  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
})

export const WelcomeFirstScreen = inject("dataStore")(
  ({ dataStore }) => {

  const { navigate } = useNavigation()

  return (
    <Swiper loop={false}>
      <Screen>
        <OnboardingScreen image={presentLogo}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.earn")}</Text>
        </OnboardingScreen>
      </Screen>
      <Screen>
        <OnboardingScreen image={dollarLogo}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.bank")}</Text>
        </OnboardingScreen>
      </Screen>
      <Screen>
        <OnboardingScreen action={async () => {
          dataStore.onboarding.add(Onboarding.walletDownloaded)
          navigate("primaryStack")
        }} image={bitcoinLogo}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.wallet")}</Text>
        </OnboardingScreen>
      </Screen>
    </Swiper>
  )
})
