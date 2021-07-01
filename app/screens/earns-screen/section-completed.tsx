import * as React from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import BadgerShovelBitcoin from "./badger-shovel-01.svg"
import { MountainHeader } from "../../components/mountain-header"
import { translate } from "../../i18n"

const styles = EStyleSheet.create({
  bottomView: {
    backgroundColor: palette.lightBlue,
    flex: 1,
  },

  buttonStyle: {
    backgroundColor: palette.white,
    borderRadius: 32,
    marginTop: "24rem",
    width: "100%",
  },

  headerSection: {
    color: palette.white,
    fontSize: "16rem",
    paddingTop: "18rem",
  },

  titleSection: {
    color: palette.white,
    fontSize: "24rem",
    fontWeight: "bold",
    paddingTop: "6rem",
  },

  titleStyle: {
    color: palette.lightBlue,
    fontSize: "18rem",
    fontWeight: "bold",
  },
})

export const SectionCompleted = ({ navigation, route }) => {
  const { amount, sectionTitle } = route.params

  return (
    <Screen backgroundColor={palette.orange} unsafe>
      <MountainHeader amount={amount} color={palette.orange} />
      <View
        style={{
          backgroundColor: palette.lightBlue,
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <View style={{ flex: 0.5, minHeight: 30 }} />
        <BadgerShovelBitcoin />
        <Text style={styles.headerSection}>
          {translate("EarnScreen.sectionsCompleted")}
        </Text>
        <Text style={styles.titleSection}>{sectionTitle}</Text>
        <Button
          title={translate("EarnScreen.keepDigging")}
          type="solid"
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          onPress={() => navigation.navigate("Earn")}
        />
      </View>
      <View style={styles.bottomView} />
      <CloseCross color={palette.white} onPress={() => navigation.navigate("Earn")} />
    </Screen>
  )
}
