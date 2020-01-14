import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { observer, inject } from "mobx-react"

import * as Progress from "react-native-progress"

import { YouTubeStandaloneIOS } from "react-native-youtube"
import { Button } from "react-native-elements"
import { Image, StyleSheet, View, Alert, Linking } from "react-native"
import { withNavigation } from "react-navigation"

import { color } from "../../theme"
import { saveString } from "../../utils/storage"
import { OnboardingSteps } from "../loading-screen"
import { PendingOpenChannelsStatus } from "../../models/data-store"
import { Loader } from "../../components/loader"

export const popcornLogo = require("./PopcornLogo.png")
export const rocketLogo = require("./RocketLogo.png")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  image: {
    alignSelf: "center",
    padding: 20,
  },

  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },

  buttonContainerVideo: {
    paddingHorizontal: 80,
  },

  buttonContainer: {
    marginBottom: 60,
    paddingHorizontal: 80,
  },

  buttonStyle: {
    backgroundColor: color.primary,
  },

  buttonVideo: {},

  progressBar: {
    alignSelf: "center",
  },

  fundingText: {
    fontSize: 16,
    textAlign: "center",
    color: color.primary,
    paddingVertical: 20,
    textDecorationLine: "underline",
  },
})

const playVideo = videoId => {
  YouTubeStandaloneIOS.playVideo(videoId)
    .then(message => console.tron.log(message))
    .catch(errorMessage => console.tron.error(errorMessage))
}

export const WelcomeSyncingScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {
      return (
        <Screen>
          <View style={{ alignContent: "center", width: "100%" }}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              syncing data... {dataStore.lnd.percentSynced}
            </Text>
            <Progress.Bar
              style={styles.progressBar}
              color={color.primary}
              progress={dataStore.lnd.percentSynced}
            />
          </View>
          <View style={styles.container}>
            <Image source={popcornLogo} style={styles.image} />
            <Text style={styles.text}>
              Almost ready to launch your wallet! This could take a minute.{"\n"}
              {"\n"}
              Earn another reward{"\n"}while you wait:
            </Text>
            <Button
              title="What is a sat? +1,000 sats"
              containerStyle={styles.buttonContainerVideo}
              buttonStyle={styles.buttonVideo}
              type="outline"
              onPress={() => playVideo("SfeUQWHA3Dc")}
            />
          </View>
          <Button
            title="Create Wallet"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            onPress={() => navigation.navigate("welcomeSyncCompleted")}
            disabled={!dataStore.lnd.syncedToChain}
          />
        </Screen>
      )
    }),
  ),
)

export const WelcomeSyncCompletedScreen = inject("dataStore")(
  observer(({ dataStore, navigation }) => {
    const [loading, setLoading] = useState(false)

    const openChannel = async () => {
      setLoading(true)

      try {
        await dataStore.lnd.sendPubKey()
        await dataStore.lnd.connectGaloyPeer()

        try {
          const funding_tx = await dataStore.lnd.openChannel()
        } catch (err) {
          Alert.alert(`${err}`)
          return
        }

        await saveString("onboarding", OnboardingSteps.channelCreated)

        navigation.navigate("welcomeGeneratingWallet")
      } finally {
        setLoading(false)
      }
    }

    return (
      <Screen>
        <Loader loading={loading} />
        <View style={{ alignContent: "center", width: "100%" }}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>Sync complete</Text>
          <Progress.Bar
            style={styles.progressBar}
            color={color.primary}
            progress={dataStore.lnd.percentSynced}
          />
        </View>
        <View style={styles.container}>
          <Image source={popcornLogo} style={styles.image} />
          <Text style={styles.text}>We are ready to launch your wallet</Text>
        </View>
        <Button
          title="Create Wallet"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          onPress={() => openChannel()}
        />
      </Screen>
    )
  }),
)

export const WelcomeGeneratingWalletScreen = inject("dataStore")(
  observer(({ dataStore, navigation }) => {
    const [fundingTx, setFundingTx] = useState("")

    const checkChannel = async () => {
      console.tron.log("check channel looping")
      const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
      if (statusChannel == PendingOpenChannelsStatus.opened) {
        navigation.navigate("welcomebackCompleted")
      }
    }

    useEffect(() => {
      const timer = setInterval(checkChannel, 3000)
      return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
      const _ = async () => {
        const { pendingOpenChannels } = await dataStore.lnd.pendingChannels()
        const channelPoint = pendingOpenChannels[0].channel.channelPoint
        const funding = channelPoint.split(":")[0]
        console.tron.log("funding: ", funding)
        setFundingTx(funding)
      }

      _()
    }, [])

    const showFundingTx = () => {
      Linking.openURL(`https://blockstream.info/testnet/tx/${fundingTx}`).catch(err =>
        console.error("Couldn't load page", err),
      )
    }

    console.tron.warn(typeof fundingTx, fundingTx)

    return (
      <Screen>
        <View style={{ alignContent: "center", width: "100%" }}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>Generating wallet...</Text>
        </View>
        <View style={styles.container}>
          <Image source={rocketLogo} style={styles.image} />
          <Text style={styles.text}>
            Sit back and relax, we’ll let you know when your wallet is ready. 
            This may take a day or so.
          </Text>
          <Button
            title="What is money?"
            containerStyle={styles.buttonContainerVideo}
            buttonStyle={styles.buttonVideo}
            type="outline"
            onPress={() => playVideo("XNu5ppFZbHo")}
          />
        </View>
        <Text style={styles.fundingText} onPress={showFundingTx}>
          funding tx: {fundingTx.substring(0, 6)}...{fundingTx.substring(fundingTx.length - 6)}
        </Text>
      </Screen>
    )
  }),
)
