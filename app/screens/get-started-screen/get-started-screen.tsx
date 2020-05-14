import * as React from "react"
import { StyleSheet, Text, View, StatusBar } from "react-native"
import { Button } from "react-native-elements"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import MascotBitcoin from "./honey-badger-01.svg"

import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import EStyleSheet from "react-native-extended-stylesheet"

const styles = EStyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    marginLeft: 0,
    width: "70%",
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
    textAlign: "center",
  },

  title: {
    color: palette.white,
    fontSize: 72,
    fontWeight: "bold",
    flex: 1,
    paddingBottom: "24rem",
  },
})

export const GetStartedScreen = () => {
  const { navigate } = useNavigation()

  return (
    <Screen style={styles.container} backgroundColor={palette.lightBlue} statusBar="light-content">
      <View style={{flex: 1}} />
      <Text style={styles.title} onPress={() => navigate("debug")}>
        Galoy
      </Text>
      <MascotBitcoin width={200} height={200} />
      <Text style={styles.sub}>{translate("GetStartedScreen.headline")}</Text>
      <View style={styles.bottom}>
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
