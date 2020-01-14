import auth from "@react-native-firebase/auth"
import { inject, observer } from "mobx-react"
import { getEnv } from "mobx-state-tree"
import * as React from "react"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { withNavigation } from "react-navigation"
import { color } from "../../theme"
import { loadString } from "../../utils/storage"
import { PendingOpenChannelsStatus } from "../../utils/enum"

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

export enum OnboardingSteps {
  phoneVerified = "phoneVerified",
  channelCreated = "channelCreated",
  onboarded = "onboarded",
}

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
        } else if (user.phoneNumber) {
          // we may be onboarding
          const onboard = await loadString("onboarding") // TODO: move this to mst
          console.tron.log(`onboard ${onboard}`)
          switch (onboard) {
            case OnboardingSteps.phoneVerified: {
              navigation.navigate("welcomeSyncing")
              break
            }
            case OnboardingSteps.channelCreated: {
              const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
              console.tron.log(`statusChannel : ${statusChannel}`)
              switch (statusChannel) {
                case PendingOpenChannelsStatus.pending: {
                  navigation.navigate("welcomeGenerating")
                  break
                }
                case PendingOpenChannelsStatus.opened: {
                  navigation.navigate("welcomebackCompleted")
                  break
                }
                case PendingOpenChannelsStatus.noChannel: {
                  console.tron.warn("no Channel but phone verified. Because of app reinstall?") 
                  navigation.navigate("authStack")
                  break
                }
                default:
                  console.tron.error("statusChannel state management error")
                  break
              }
              break
            }
            case OnboardingSteps.onboarded: {
              navigation.navigate("primaryStack")
              break
            }
            default:
              console.tron.warn("no path for onboarding, state onboarding issue")
              navigation.navigate("authStack")
          }
        } else {
          throw new Error("this state should not happen")
        }
      }

      useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
        return subscriber // unsubscribe on unmount
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
