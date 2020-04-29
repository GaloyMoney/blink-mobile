import * as React from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import BadgerShovelBitcoin from "./badger-shovel-01.svg"
import Montain from "./mointains-cloud-01.svg"

const styles = EStyleSheet.create({
  headerSection: { color: palette.white,
    fontSize: "16rem",
    paddingTop: "18rem"
  },

  titleSection: { color: palette.white, fontWeight: "bold",
    fontSize: "24rem",
    paddingTop: "6rem"
  },

  buttonStyle: {
    backgroundColor: palette.white, 
    borderRadius: 32, 
    width: "100%",
    marginTop: "24rem"
  },

  titleStyle: {
    color: palette.lightBlue, 
    fontWeight: "bold",
    fontSize: "18rem"
  },

  bottomView: {
    flex: 1,
    backgroundColor: palette.lightBlue,
  },

  mountainView: {
    backgroundColor: palette.orange,
    alignItems: "center",
  },

  topView: {
    marginTop: "80rem",
  }
})

export const SectionCompleted = ({ section, amount, navigation }) => {
  return (
    <Screen backgroundColor={palette.orange} unsafe={true}>
      <View style={styles.topView}>
        <View style={{alignItems: "center", paddingBottom: 16}}>
          <Text style={styles.headerSection}>You Earned</Text>
          <Text style={styles.titleSection}>{amount} sats</Text>
        </View>
      </View>
      <View style={styles.mountainView}>
        <Montain />
      </View>
      <View
        style={{
          backgroundColor: palette.lightBlue,
          alignItems: "center",
          flexGrow: 1
        }}
      >
        <View style={{ flex: .1, minHeight: 30 }}></View>
        <BadgerShovelBitcoin />
        <Text style={styles.headerSection}>You've completed</Text>
        <Text style={styles.titleSection}>{section}</Text>
        <Button title="Keep Digging" type="solid" 
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          onPress={navigation.navigate("Earn")}
          />
      </View>
      <View style={styles.bottomView}></View>
      <CloseCross color={palette.white} navigation={navigation} />
    </Screen>
  )
}
