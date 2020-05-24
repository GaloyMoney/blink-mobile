import * as React from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import BadgerShovelBitcoin from "./badger-shovel-01.svg"
import { MountainHeader } from "../../components/mountain-header"

const styles = EStyleSheet.create({
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
  
  headerSection: { color: palette.white,
    fontSize: "16rem",
    paddingTop: "18rem"
  },

  titleSection: { color: palette.white, 
    fontWeight: "bold",
    fontSize: "24rem",
    paddingTop: "6rem"
  },
})

export const SectionCompleted = ({ navigation, route }) => {
  const { amount, sectionTitle } = route.params

  return (
    <Screen backgroundColor={palette.orange} unsafe={true}>
      <MountainHeader amount={amount} color={palette.orange} />
      <View
        style={{
          backgroundColor: palette.lightBlue,
          alignItems: "center",
          flexGrow: 1
        }}
      >
        <View style={{ flex: .5, minHeight: 30 }}></View>
        <BadgerShovelBitcoin />
        <Text style={styles.headerSection}>You've completed</Text>
        <Text style={styles.titleSection}>{sectionTitle}</Text>
        <Button title="Keep Digging" type="solid" 
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          onPress={() => navigation.navigate("Earn")}
          />
      </View>
      <View style={styles.bottomView}></View>
      <CloseCross color={palette.white} onPress={() => navigation.navigate("Earn")} />
    </Screen>
  )
}
