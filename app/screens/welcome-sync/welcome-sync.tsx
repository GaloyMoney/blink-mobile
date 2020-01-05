import * as React from "react"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { observer, inject } from 'mobx-react'

import * as Progress from 'react-native-progress';

export const WelcomeSyncScreen = inject("dataStore")(observer(({dataStore, otherProps}) => {

  return (
      <Screen>
        <Text>syncing data... {dataStore.lnd.percentSynced}</Text>
        <Progress.Bar progress={dataStore.lnd.percentSynced} width={200} />
      </Screen>
  )
}))