import * as React from "react"
import { useState } from "react"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { observer, inject } from 'mobx-react'

import * as Progress from 'react-native-progress'

import { YouTubeStandaloneIOS } from 'react-native-youtube';
import { Button } from "react-native-elements"
import { Image, StyleSheet, View } from "react-native"
import { withNavigation } from "react-navigation"

import auth from '@react-native-firebase/auth'
import { color } from "../../theme"
import { saveString } from "../../utils/storage"
import { OnboardingSteps } from "../login-screen"
import { PendingOpenChannelsStatus } from "../../models/data-store"
import { Loader } from "../../components/loader"

export const lightningBolt = require("../welcome-screens/LightningBolt.png")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  image: {
    alignSelf: 'center',
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
    backgroundColor: color.primary
  },
  
  buttonVideo: {
  },

  progressBar: {
    alignSelf: "center",
  }
  
})

const playVideo = (videoId) => {
  YouTubeStandaloneIOS.playVideo(videoId)
  .then(message => console.tron.log(message))
  .catch(errorMessage => console.tron.error(errorMessage));
}

export const WelcomeSyncingScreen = withNavigation(inject("dataStore")(observer(({dataStore, navigation}) => {

  return (
    <Screen>
      <View style={{alignContent: 'center', width: "100%"}}>
        <Text style={[styles.text, {fontWeight: "bold"}]}>syncing data... {dataStore.lnd.percentSynced}</Text>
        <Progress.Bar style={styles.progressBar} 
                      color={color.primary}
                      progress={dataStore.lnd.percentSynced} />
      </View>
      <View style={styles.container}>
        <Image source={lightningBolt} style={styles.image} />
        <Text style={styles.text}>Almost ready to launch your wallet! This could take a minute.
        {"\n"}{"\n"}Earn another reward{"\n"}while you wait:</Text>
        <Button title="What is a sat? +1,000 sats" 
                containerStyle={styles.buttonContainerVideo}
                buttonStyle={styles.buttonVideo}
                type="outline"
                onPress={() => playVideo('SfeUQWHA3Dc')} />
      </View>
      <Button title="Create Wallet"
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.buttonStyle}
              onPress={() => navigation.navigate('welcomeSyncCompleted')}
              disabled={!dataStore.lnd.syncedToChain} />
    </Screen>
  )
})))

export const WelcomeSyncCompletedScreen = inject("dataStore")(observer(({dataStore, navigation}) => {
  const [loading, setLoading] = useState(false);

  const openChannel = async () => {
    setLoading(true)

    try {
      const lnd = dataStore.lnd
      const result = await auth().signInAnonymously()
      console.tron.log('auth', result)
      await lnd.sendPubKey()
      await lnd.connectGaloyPeer()
      await lnd.openChannel()
  
      saveString('onboarding', OnboardingSteps.channelCreated)
      
      // await lnd.pendingChannels()
      // https://blockstream.info/testnet/api/tx/${tx}
      navigation.navigate('welcomeGeneratingWallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <Loader loading={loading} />
      <View style={{alignContent: 'center', width: "100%"}}>
        <Text style={[styles.text, {fontWeight: "bold"}]}>Sync complete</Text>
        <Progress.Bar style={styles.progressBar} 
                      color={color.primary}
                      progress={dataStore.lnd.percentSynced} />
      </View>
      <View style={styles.container}>
        <Image source={lightningBolt} style={styles.image} />
        <Text style={styles.text}>We are ready to launch your wallet</Text>
      </View>
      <Button title="Create Wallet"
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.buttonStyle}
              onPress={() => openChannel()}
              />
    </Screen>
  )
}))

export const WelcomeGeneratingWalletScreen = inject("dataStore")(observer(({dataStore, navigation}) => {

  const checkChannel = async () => {
    console.tron.log('check channel looping')
    const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
    if (statusChannel == PendingOpenChannelsStatus.opened) {
      navigation.navigate('welcomebackCompleted')
    }
  }

  React.useEffect(() => {
    const timer = setInterval(checkChannel, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <View style={{alignContent: 'center', width: "100%"}}>
        <Text style={[styles.text, {fontWeight: "bold"}]}>
          Generating wallet...
        </Text>
      </View>
      <View style={styles.container}>
        <Image source={lightningBolt} style={styles.image} />
        <Text style={styles.text}>Sit back and relax, 
        we’ll let you know when your wallet is ready. 
        This may take a day or so.</Text>
        <Button title="What is money?" 
                containerStyle={styles.buttonContainerVideo}
                buttonStyle={styles.buttonVideo}
                type="outline"
                onPress={() => playVideo('XNu5ppFZbHo')} />
      </View>
      <Text style={styles.text}>Funding tx: TODO{"\n"}
            When should your wallet be ready?</Text>
    </Screen>
  )
}))
