import * as React from "react"
import { ActivityIndicator, Image, SafeAreaView, StyleSheet } from "react-native"
import { VersionComponent } from "../../components/version"
import { palette } from "../../theme/palette"
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")


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
    backgroundColor: palette.lightBlue,
  },

  Logo: {
    maxHeight: 300,
    maxWidth: 310,
    marginTop: 32,
  },

  bottom: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },
})

export const SplashScreen = ({}) => (
  <SafeAreaView style={styles.container}>
    <Image
      style={styles.Logo}
      source={BitcoinBeachLogo}
    />
    <VersionComponent style={{ paddingVertical: 30 }} />
    <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
  </SafeAreaView>
)