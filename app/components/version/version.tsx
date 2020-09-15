import * as React from "react"
import { StyleSheet, Text } from "react-native"
import Config from "react-native-config"
import VersionNumber from "react-native-version-number"
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  version: {
    color: palette.lighterGrey,
    fontSize: 18,
    marginTop: 18,
    textAlign: "center",
  },
})

export const VersionComponent = ({ style }) => (
  <Text style={[styles.version, style]}>
    v{VersionNumber.appVersion} build {VersionNumber.buildVersion}
    {"\n"}
    {/* network: {Config.BITCOIN_NETWORK} TODO */}
    {/* FIXME should be a props */}
  </Text>
)
