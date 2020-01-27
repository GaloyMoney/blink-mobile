import * as React from "react"
import { Screen } from "../../components/screen"
import { observer, inject } from "mobx-react"


import { YouTubeStandaloneIOS } from "react-native-youtube"
import { ListItem } from "react-native-elements"
import { Image, StyleSheet, View, Alert } from "react-native"

import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { Onboarding } from "../../../../common/types"


export const popcornLogo = require("../welcome-sync/PopcornLogo.png")

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

export const RewardsVideoScreen = inject("dataStore")(observer(
  ({ dataStore }) => {

    const playVideo = async videoId => {
      try {
        await YouTubeStandaloneIOS.playVideo(videoId)
        await dataStore.onboarding.add(Onboarding.rewardsVideo)
      } catch (err) {
        console.tron.error(err)
        Alert.alert(err.toString())
      }
    }

    return (
      <Screen>
        <View style={styles.container}>
            <Image source={popcornLogo} style={styles.image} />
            <ListItem
              titleStyle={styles.textButton}
              style={styles.button}
              key={0}
              title="What is money?"
              // leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
              onPress={() => playVideo("XNu5ppFZbHo")}
              badge={{value: "+1,000 sats", badgeStyle: {backgroundColor: color.primary}}}
              chevron
            />
        </View>
      </Screen>
      )
}))
