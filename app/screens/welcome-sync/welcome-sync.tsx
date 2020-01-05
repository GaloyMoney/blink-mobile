import * as React from "react"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { observer, inject } from 'mobx-react'

import * as Progress from 'react-native-progress'

import { YouTubeStandaloneIOS } from 'react-native-youtube';
import { Button } from "react-native-elements"

export const WelcomeSyncScreen = inject("dataStore")(observer(({dataStore, otherProps}) => {

  const playVideo = () => {
    YouTubeStandaloneIOS.playVideo('SfeUQWHA3Dc')
    .then(message => console.log(message))
    .catch(errorMessage => console.error(errorMessage));
  }

  return (
      <Screen>
        <Text>syncing data... {dataStore.lnd.percentSynced}</Text>
        <Progress.Bar progress={dataStore.lnd.percentSynced} width={200} />
        <Button title="What is a sat" onPress={() => playVideo()} />
        {/* <Button title="Next" onPress={() => otherProps.navigation.navigate()} /> */}
      </Screen>
  )
}))