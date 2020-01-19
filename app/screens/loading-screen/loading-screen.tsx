import auth from "@react-native-firebase/auth"
import { inject, observer } from "mobx-react"
import { getEnv } from "mobx-state-tree"
import * as React from "react"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View, Alert } from "react-native"
import { withNavigation } from "react-navigation"
import { color } from "../../theme"
import { PendingOpenChannelsStatus, Onboarding } from "../../utils/enum"

const styles = StyleSheet.create({
  centerBackground: {
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

export const LoadingScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {
      
      useEffect(() => {
        const startLnd = async () => {
          getEnv(dataStore).lnd.start()
        }

        startLnd()
      }, [])

      //  await saveString('onboarding', '') // for debug FIXME

      const onAuthStateChanged = async user => {
        // TODO : User type
        console.tron.log(`onAuthStateChanged`, user)
        console.log(`onAuthStateChanged`, user)
        if (user === null) {
          // new install or no data yet
          navigation.navigate("authStack")
        } else {
          switch (dataStore.onboarding.stage) {
            case Onboarding.phoneVerified:
              navigation.navigate("welcomeSyncing")
              break
            case Onboarding.channelCreated: 
              const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
              console.tron.log(`statusChannel : ${statusChannel}`)
              switch (statusChannel) {
                case PendingOpenChannelsStatus.pending:
                  navigation.navigate("welcomeGenerating")
                  break
                case PendingOpenChannelsStatus.opened:
                  navigation.navigate("welcomebackCompleted")
                  break
                case PendingOpenChannelsStatus.noChannel:
                  console.tron.warn("no Channel but user is verified. Because of app reinstall?") 
                  navigation.navigate("authStack")
                  break
                default:
                  console.tron.error("statusChannel state management error")
                  navigation.navigate("authStack")
                  break
              }
            case Onboarding.walletOnboarded: 
            case Onboarding.bankOnboarded:
              navigation.navigate("primaryStack")
              break
            default:
              const err = "no path for onboarding, state onboarding issue"
              Alert.alert(err)
              navigation.navigate("authStack")
              break
        }
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
