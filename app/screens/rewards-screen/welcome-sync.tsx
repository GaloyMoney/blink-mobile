import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { observer, inject } from "mobx-react"

import * as Progress from "react-native-progress"

import { Button } from "react-native-elements"
import { Image, StyleSheet, View, Alert, Linking } from "react-native"
import { withNavigation } from "react-navigation"

import { color } from "../../theme"
import { PendingFirstChannelsStatus } from "../../utils/enum"
import { palette } from "../../theme/palette"
import { shortenHash } from "../../utils/helper"
import { useNavigation } from "react-navigation-hooks"
import { Onboarding } from "types"


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

  textButton: {
    fontSize: 18,
    color: palette.darkGrey
  },

  button: {
      marginHorizontal: 40,
      paddingVertical: 6,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: color.primary
  },

})


export const ChannelSyncScreen = withNavigation(
  inject("dataStore")(
    observer(({ dataStore, navigation }) => {

      const [loading, setLoading] = useState(false)
      const [err, setErr] = useState("")

      const openChannel = async () => {
        setLoading(true)
  
        try {
          await dataStore.lnd.sendPubKey()
          await dataStore.lnd.connectGaloyPeer()
  
          const funding_tx = await dataStore.lnd.openChannel()
  
          await dataStore.onboarding.add(Onboarding.channelCreated)

          setLoading(false)
          navigation.navigate("welcomeGeneratingWallet")
        } catch (err) {
          setErr(err.toString())
        }
      }
    
      useEffect(() => {
        if (err !== "") {
          setErr("")
          Alert.alert("error", err, [
            {
              text: "OK",
              onPress: () => {
                setLoading(false)
              },
            },
          ])
        }
      }, [err])

      return (
        <Screen>
          <View style={{ alignContent: "center", width: "100%" }}>
              { !dataStore.lnd.syncedToChain &&
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                  Syncing data... {dataStore.lnd.percentSynced * 100}%
              </Text>
              }
              { dataStore.lnd.syncedToChain && 
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  Sync complete
                </Text>
              }
            <Progress.Bar
              style={styles.progressBar}
              color={color.primary}
              progress={dataStore.lnd.percentSynced}
            />
          </View>
          <View style={styles.container}>
          { !dataStore.lnd.syncedToChain &&
            <>
              <Image source={popcornLogo} style={styles.image} />
              <Text style={styles.text}>
                Almost ready to launch your wallet! This could take a minute.
              </Text>
            </>
            }
            { dataStore.lnd.syncedToChain &&
              <Text style={styles.text}>We are ready to launch your wallet</Text>
            }
          </View>
          <Button
            title="Create Wallet"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.buttonStyle}
            onPress={openChannel}
            disabled={!dataStore.lnd.syncedToChain}
            loading={loading}
          />
        </Screen>
      )
    }),
  ),
)

export const ChannelCreateScreen = inject("dataStore")(
  observer(({ dataStore }) => {
    const [fundingTx, setFundingTx] = useState("")

    const { navigate } = useNavigation()

    const checkChannel = async () => {
      console.tron.log("check channel looping")
      const statusChannel = await dataStore.lnd.statusFirstChannelOpen()
      if (statusChannel == PendingFirstChannelsStatus.opened) {
        navigate("welcomebackCompleted")
      }
    }

    useEffect(() => {
      const timer = setInterval(checkChannel, 3000)
      return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
      const _ = async () => {
        await dataStore.lnd.updatePendingChannels()
        const funding = dataStore.lnd.pendingChannels[0]?.channelPoint.split(":")[0]
        setFundingTx(funding)
      }

      _()
    }, [])

    const showFundingTx = () => {
      Linking.openURL(`https://blockstream.info/testnet/tx/${fundingTx}`).catch(err =>
        console.error("Couldn't load page", err),
      )
    }

    return (
      <Screen>
        <View style={{ alignContent: "center", width: "100%" }}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>Launching wallet...</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.text}>
            This may take an hour.
          </Text>
          <Image source={rocketLogo} style={styles.image} />
          <Text style={styles.text}>
            You can close the app, we’ll send you a text when your wallet is ready. 
          </Text>
        </View>
        <Text style={styles.fundingText} onPress={showFundingTx}>
          funding tx: {shortenHash(fundingTx)}
        </Text>
      </Screen>
    )
  }),
)
