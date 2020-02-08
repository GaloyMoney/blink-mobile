import * as React from "react"
import { Text, StyleSheet } from "react-native"

import VersionNumber from 'react-native-version-number';
import Config from "react-native-config";
import { palette } from "../../theme/palette"
import { inject, observer } from "mobx-react";

const styles = StyleSheet.create({
version: {
    fontSize: 18,
    marginTop: 100,
    color: palette.lightGrey,
    textAlign: 'center',
  }
})

export const VersionComponent = inject("dataStore")(observer(({dataStore, style}) => (
    <Text style={[style, styles.version]}>
        v{VersionNumber.appVersion} build {VersionNumber.buildVersion}{'\n'}
        network: {Config.BITCOIN_NETWORK}{'\n'}
        lnd: {dataStore.lnd.version}
    </Text>
)))