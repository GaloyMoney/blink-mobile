import auth from "@react-native-firebase/auth"
import { inject, observer } from "mobx-react"
import { getEnv } from "mobx-state-tree"
import * as React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { color } from "../../theme"
import { when } from "mobx"
import { VersionComponent } from "../../components/version"
import { Onboarding } from "types"
import { useNavigation } from "react-navigation-hooks"


const styles = StyleSheet.create({
  centerBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
  },
})

// FIXME properly use the right callback function
const INIT_DELAY_LND = 100

export const LoadingScreen = inject("dataStore")(observer(
  ({ dataStore }) => {
  
  const [ authReady, setAuthReady ] = useState(false)

  const { navigate } = useNavigation()

  useEffect(() => {
    const startLnd = async () => {
      getEnv(dataStore).lnd.start()
    }

    startLnd()

    setTimeout(async function(){ 
      await getEnv(dataStore).lnd.openWallet()
    }, INIT_DELAY_LND) 

  }, [])

  const onAuthStateChanged = async user => {
    console.tron.log(`onAuthStateChanged`, user)
    console.log(`onAuthStateChanged`, user)

    if (user == null) {
      await auth().signInAnonymously()
    } else (
      setAuthReady(true)
    )
  }

  useEffect(() => {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
      return subscriber; // unsubscribe on unmount
  }, [])

  useEffect(() => {
    const _ = async () => {
      await when(() => dataStore.lnd.lndReady === true)
      when(() => authReady)

      if (dataStore.onboarding.has(Onboarding.walletDownloaded)) {
        navigate("primaryStack")
      } else {
        // new install
        navigate("authStack")        
      }
    }

    _()
    }, [])

    return (
      <View style={styles.centerBackground}>
        <ActivityIndicator style={{flex: 1}} size="large" color={color.primary} />
        <VersionComponent style={{paddingVertical: 30}} />
      </View>
      )
}))
