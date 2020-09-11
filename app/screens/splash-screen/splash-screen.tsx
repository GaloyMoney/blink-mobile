import * as React from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { Image } from "react-native-svg"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")

import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  centerBackground: {
    alignItems: "center",
    backgroundColor: palette.lightBlue,
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  Logo: {
    maxHeight: 300,
    maxWidth: 310
  },

  bottom: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },
})

export const SplashScreen = ({}) => (
  <Screen style={styles.container} backgroundColor={palette.lightBlue} statusBar="light-content">
    <View style={styles.centerBackground}>
      <Image
        style={styles.Logo}
        source={BitcoinBeachLogo}
      />
     <View style={styles.bottom}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
        <VersionComponent style={{ paddingVertical: 30 }} />
     </View>
    </View>
  </Screen>
)