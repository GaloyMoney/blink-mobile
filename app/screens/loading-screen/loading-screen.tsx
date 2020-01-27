import auth from "@react-native-firebase/auth"
import { inject, observer } from "mobx-react"
import { getEnv } from "mobx-state-tree"
import * as React from "react"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View, Alert } from "react-native"
import { withNavigation } from "react-navigation"
import { color } from "../../theme"
import { when } from "mobx"

const styles = StyleSheet.create({
  centerBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    // backgroundColor: "#FFFFFF",
    // height: 100,
    // width: 100,
    // borderRadius: 10,
    // display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
})

export const LoadingScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {
      
      useEffect(() => {
        const startLnd = async () => {
          getEnv(dataStore).lnd.start()
        }

        startLnd()

        setTimeout(async function(){ 
          await getEnv(dataStore).lnd.openWallet()
        }, 2000)

      }, [])

      const onAuthStateChanged = async user => {
        // TODO : User type
        console.tron.log(`onAuthStateChanged`, user)
        console.log(`onAuthStateChanged`, user)

        await when(() => dataStore.lnd.lndReady === true)

        if (user === null) {
          // new install or no data yet
          navigation.navigate("authStack")
        } else {
          navigation.navigate("primaryStack")

          /*
          const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
          switch (dataStore.onboarding.stage) {
            case Onboarding.walletOnboarded: 
            case Onboarding.bankOnboarded:
              // TODO: manage the case if user and no channels
              navigation.navigate("primaryStack")
              break
            default:
              console.tron.log(`statusChannel : ${statusChannel}`)
              switch (statusChannel) {
                case PendingFirstChannelsStatus.pending:
                  navigation.navigate("welcomeGenerating")
                  break
                case PendingFirstChannelsStatus.opened:
                  navigation.navigate("welcomebackCompleted")
                  break
                case PendingFirstChannelsStatus.noChannel:
                  navigation.navigate("welcomeSyncing")
                }
              break
          */
        
      }}

useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber; // unsubscribe on unmount
}, [])

    return (
      <View style={styles.centerBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      </View>
      )
    }),
  ),
)
