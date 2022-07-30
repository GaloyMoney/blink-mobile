import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Image, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { translate } from "@app/utils/translate"

import BitcoinBeachLogo from "./bitcoin-beach-logo.png"

const styles = EStyleSheet.create({
  Logo: {
    marginTop: 24,
    maxHeight: "50%",
    maxWidth: "85%",
  },

  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  button: {
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
  },

  buttonTitle: {
    color: palette.white,
    fontWeight: "bold",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  version: { paddingTop: 18 },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "getStarted">
}

export const GetStartedScreen: ScreenType = ({ navigation }: Props) => (
  <Screen
    style={styles.container}
    backgroundColor={palette.white}
    statusBar="light-content"
  >
    <Image style={styles.Logo} source={BitcoinBeachLogo} resizeMode="contain" />
    <VersionComponent style={styles.version} />
    <View style={styles.bottom}>
      <Button
        title={translate("GetStartedScreen.getStarted")}
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={() => navigation.replace("welcomeFirst")}
        containerStyle={styles.buttonContainer}
        testID={translate("GetStartedScreen.getStarted")}
      />
    </View>
  </Screen>
)
