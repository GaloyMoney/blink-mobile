import * as React from "react"
import { Text, StyleSheet } from "react-native"

import VersionNumber from "react-native-version-number"
import Config from "react-native-config"
import { color } from "../../theme"

const styles = StyleSheet.create({
  version: {
    fontSize: 18,
    marginTop: 100,
    color: color.text,
    textAlign: "center",
  },
})

export const VersionComponent = ({ style, lndVersion }) => (
  <Text style={[style, styles.version]}>
    v{VersionNumber.appVersion} build {VersionNumber.buildVersion}
    {"\n"}
    network: {Config.BITCOIN_NETWORK}
    {"\n"}
    lnd: {lndVersion}
  </Text>
)
