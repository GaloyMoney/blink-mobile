import { inject } from "mobx-react"
import * as React from "react"
import { View, Text } from "react-native"
import Swiper from "react-native-swiper"
import { Onboarding } from "types"
import { OnboardingScreen } from "../../components/onboarding"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import BitcoinBitcoin from "./bitcoin-bitcoin-01.svg"
import BankShop from "./cc-bank-shop-01.svg"
import MascotDollarBitcoin from "./honey-badger-money-bitcoin-01.svg"
import HoneyBadgerShovel from "./honey-badger-shovel-01.svg"
import EStyleSheet from "react-native-extended-stylesheet"


const styles = EStyleSheet.create({
  $paddingHorizontal: "40rem",
  $color: palette.white,
  $fontWeight: "bold",
  $textAlign: "center",

  text: {
    fontSize: "20rem",
    textAlign: "$textAlign",
    // fontWeight: "$fontWeight",
    paddingTop: "24rem",
    color: "$color",
    paddingHorizontal: '$paddingHorizontal',
  },

  title: {
    fontSize: "30rem",
    textAlign: "$textAlign",
    fontWeight: "$fontWeight",
    color: "$color",
    paddingTop: "24rem",
  },
})

export const WelcomeFirstScreen = inject("dataStore")(({ dataStore, navigation }) => {
  return (
    <Swiper
      loop={false}
      activeDot={
        <View
          style={{
            backgroundColor: palette.white,
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3,
          }}
        />
      }
    >
      <Screen backgroundColor={palette.lightBlue}>
        <OnboardingScreen Svg={MascotDollarBitcoin}>
          <Text style={styles.title}>Bitcoin:</Text>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.care")}</Text>
        </OnboardingScreen>
      </Screen>
      <Screen backgroundColor={palette.lightBlue}>
        <OnboardingScreen Svg={BitcoinBitcoin}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.bank")}</Text>
        </OnboardingScreen>
      </Screen>
      <Screen backgroundColor={palette.lightBlue}>
        <OnboardingScreen Svg={BankShop}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.before")}</Text>
        </OnboardingScreen>
      </Screen>
      <Screen backgroundColor={palette.lightBlue}>
        <OnboardingScreen
          action={async () => {
            dataStore.onboarding.add(Onboarding.walletDownloaded)
            navigation.navigate("primaryStack")
          }}
          Svg={HoneyBadgerShovel}
          nextTitle="Learn to Earn"
        >
          <Text style={styles.text}>{translate("WelcomeFirstScreen.learn")}</Text>
        </OnboardingScreen>
      </Screen>
    </Swiper>
  )
})
