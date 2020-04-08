import * as React from "react"
import { Screen } from "../../components/screen"
import { OnboardingScreen } from "../../components/onboarding"
import { Text } from "../../components/text"
import { inject } from "mobx-react"
import { Onboarding } from "types"
import { StyleSheet, View } from "react-native"

import { color } from "../../theme"

import Swiper from "react-native-swiper"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"

import MascotDollarBitcoin from "./honey-badger-money-bitcoin-01.svg"
import BitcoinBitcoin from "./bitcoin-bitcoin-01.svg"
import BankShop from "./cc-bank-shop-01.svg"
import HoneyBadgerShovel from "./honey-badger-shovel-01.svg"

const styles = StyleSheet.create({
  activityIndicatorWrapper: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    display: "flex",
    height: 100,
    justifyContent: "space-around",
    width: 100,
  },

  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  image: {
    alignSelf: "center",
    height: 90,
    padding: 20,
    resizeMode: "center",
  },

  modalBackground: {
    alignItems: "center",
    backgroundColor: "#00000040",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },

  phoneEntryContainer: {
    borderColor: color.palette.darkGrey,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 60,
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  text: {
    fontSize: 20,
    paddingBottom: 10,
    paddingHorizontal: 40,
    textAlign: "center",
  },

  textEntry: {
    color: color.palette.darkGrey,
    fontSize: 20,
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
      <Screen>
        <OnboardingScreen Svg={MascotDollarBitcoin}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.care")}</Text>
        </OnboardingScreen>
        {/* FIXME */}
        <Text style={styles.text}>{"\n\n"}</Text>
      </Screen>
      <Screen>
        <OnboardingScreen Svg={BitcoinBitcoin}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.bank")}</Text>
        </OnboardingScreen>
        <Text style={styles.text}>{"\n\n\n"}</Text>
      </Screen>
      <Screen>
        <OnboardingScreen Svg={BankShop}>
          <Text style={styles.text}>{translate("WelcomeFirstScreen.before")}</Text>
        </OnboardingScreen>
        <Text style={styles.text}>{"\n\n\n"}</Text>
      </Screen>
      <Screen>
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
