import * as React from "react"
import { observer, inject } from "mobx-react"

import { View, Text, StyleSheet } from "react-native"
import * as Progress from "react-native-progress"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
    text: {
        marginHorizontal: 20,
        marginBottom: 10,
        textAlign: "center",
        fontSize: 16,
        color: palette.darkGrey,
    },

    sync: {
        alignContent: "center",
        width: "100%",
        marginVertical: 30,
      },
    
    progressBar: {
        alignSelf: "center",
    },
})

export const SyncingComponent = inject("dataStore")(observer(
    ({ dataStore }) => {
        
    return (<View style={styles.sync}>
        <Text style={styles.text}>
            {translate(`RewardsScreen.channelCreated.syncing`)}{" "}
            {(dataStore.lnd.percentSynced * 100).toFixed(2)}%
        </Text>
        <Progress.Bar
        style={styles.progressBar}
        color={color.primary}
        progress={dataStore.lnd.percentSynced}
        />
    </View>
)}))
