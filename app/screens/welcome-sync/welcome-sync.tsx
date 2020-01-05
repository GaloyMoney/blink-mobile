import * as React from "react"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { observer, inject } from 'mobx-react'
import  {bowserLogo } from "./"

import * as Progress from 'react-native-progress'

import { YouTubeStandaloneIOS } from 'react-native-youtube';
import { Button } from "react-native-elements"
import { Image } from "react-native"
import { withNavigation } from "react-navigation"

import auth from '@react-native-firebase/auth'

const playVideo = (videoId) => {
  YouTubeStandaloneIOS.playVideo(videoId)
  .then(message => console.log(message))
  .catch(errorMessage => console.error(errorMessage));
}

export const WelcomeSyncingScreen = withNavigation(inject("dataStore")(observer(({dataStore, navigation}) => {

  return (
    <Screen>
      <Text>syncing data... {dataStore.lnd.percentSynced}</Text>
      <Progress.Bar progress={dataStore.lnd.percentSynced} width={200} />
      <Button title="What is a sat" onPress={() => playVideo('SfeUQWHA3Dc')} />
      <Button title="Next" 
              onPress={() => navigation.navigate('welcomeSyncCompleted')}
              disabled={!dataStore.lnd.syncedToChain} />
    </Screen>
  )
})))

export const WelcomeSyncCompletedScreen = inject("dataStore")(observer(({dataStore, navigation}) => {

  const openChannel = async () => {
    const lnd = dataStore.lnd
    const result = await auth().signInAnonymously()
    console.tron.log('auth', result)
    await lnd.sendPubKey()
    await lnd.connectGaloyPeer()
    await lnd.openChannel()

    // await lnd.pendingChannels()
    // https://blockstream.info/testnet/api/tx/${tx}
    navigation.navigate('welcomeGenerating')
  }

  return (
    <Screen>
      {/* TODO make a component for sync */}
      <Text>Sync complete</Text>
      <Progress.Bar progress={dataStore.lnd.percentSynced} width={200} />
      <Image source={bowserLogo} />
      <Text>We are ready to launch your wallet</Text>
      <Button title="Create Wallet" onPress={() => openChannel()} />
    </Screen>
  )
}))

export const WelcomeGeneratingWallet = inject("dataStore")(observer(({dataStore, navigation}) => {

  return (
    <Screen>
      <Text>Generating wallet...</Text>
      <Image source={bowserLogo} />
      <Text>Sit back and relax, we’ll let you know when your wallet is ready. This may take a day or so.</Text>
      <Button title="What is a sat" onPress={() => playVideo('XNu5ppFZbHo')} />
      <Text>Funding tx: TODO</Text>
      <Text>When should the wallet be ready?: ETA</Text>
    </Screen>
  )
}))