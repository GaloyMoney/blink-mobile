import * as React from "react"
import { observer, inject } from "mobx-react"

import { View, Text, StyleSheet } from "react-native"
import * as Progress from "react-native-progress"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  progressBar: {
    alignSelf: "center",
  },

  sync: {
    alignContent: "center",
    marginVertical: 30,
    width: "100%",
  },

  text: {
    color: palette.darkGrey,
    fontSize: 16,
    marginBottom: 10,
    marginHorizontal: 20,
    textAlign: "center",
  },
})

export const SyncingComponent = inject("dataStore")(
  observer(({ dataStore }) => {
    return (
      <View style={styles.sync}>
        <Text style={styles.text}>
          {translate(`common.syncing`)} {(dataStore.lnd.percentSynced * 100).toFixed(2)}%
        </Text>
        <Progress.Bar
          style={styles.progressBar}
          color={color.primary}
          progress={dataStore.lnd.percentSynced}
        />
      </View>
    )
  }),
)
