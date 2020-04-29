import * as React from "react"

import { View, ActivityIndicator, StyleSheet } from "react-native"
import { VersionComponent } from "../../components/version"
import { color } from "../../theme"

import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  centerBackground: {
    alignItems: "center",
    backgroundColor: palette.lightBlue,
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },
})

export const SplashScreen = ({}) => (
  <View style={styles.centerBackground}>
    <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
    <VersionComponent style={{ paddingVertical: 30 }} />
  </View>
)
