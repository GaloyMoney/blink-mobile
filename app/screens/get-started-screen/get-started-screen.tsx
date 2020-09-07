import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Image, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"


const BitcoinBeachLogo = require("./bitcoinBeach3.png")

const styles = EStyleSheet.create({
  bottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: 36,
    width: "100%",
  },

  button: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  form: {
    marginHorizontal: 32,
    marginVertical: 12,
  },

  sub: {
    color: palette.white,
    fontSize: 18,
    marginTop: 32,
    marginBottom: 16,
    textAlign: "center",
  },

  title: {
    color: palette.white,
    fontSize: 72,
    fontWeight: "bold",
    flex: 1,
    paddingBottom: "24rem",
  },

  Logo: {
    maxHeight: 300,
    maxWidth: 310
  }
})

export const GetStartedScreen = () => {
  const { navigate } = useNavigation()

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue} statusBar="light-content">
      <View style={{flex: 1}} />
      {/* <Text style={styles.title} onPress={() => navigate("debug")}>
        Galoy
      </Text> */}
      {/* <MascotBitcoin width={200} height={200} /> */}
      <Image
        style={styles.Logo}
        source={BitcoinBeachLogo}
      />
      <View style={styles.bottom}>
        <Text style={styles.sub}>{translate("GetStartedScreen.headline")}</Text>
        <Button
          title={translate("GetStartedScreen.getStarted")}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={() => navigate("welcomeFirst")}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </Screen>
  )
}
