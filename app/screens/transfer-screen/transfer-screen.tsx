import { translate } from "@app/i18n"
import { palette } from "@app/theme"
import React from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView } from "react-native-gesture-handler"

export const TransferScreenDataInjected = (props: TransferScreenProps) => {
  return <TransferScreen {...props} />
}

export const TransferScreen = (props: TransferScreenProps) => {
  return (
    <ScrollView style={styles.transferScreenContainer}>
      <View style={styles.fieldContainer}>
        <View style={styles.fromToFieldContainer}>
          <View style={styles.fromFieldContainer}>
            <Text style={styles.fieldLabel}>{translate("common.from")}</Text>
          </View>
          <View style={styles.toFieldContainer}>
            <Text style={styles.fieldLabel}>{translate("common.to")}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = EStyleSheet.create({
  transferScreenContainer: {
    flex: 1,
    flexDirection: "column",
  },
  fieldContainer: {
    padding: 10,
  },
  fromToFieldContainer: {
    backgroundColor: palette.white,
    borderRadius: 10,
  },
  toFieldContainer: {
    flexDirection: "row",
  },
  fromFieldContainer: {
    borderBottomWidth: 1,
    borderColor: palette.lighterGrey,
    flexDirection: "row",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.lapisLazuli,
    padding: 10,
  },
})
