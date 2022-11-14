import { useI18nContext } from "@app/i18n/i18n-react"
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
import { testProps } from "../../../utils/testProps"

import PuraVidaLogo from "./puravida-logo.png"

const styles = EStyleSheet.create({
  Logo: {
    marginTop: 24,
    maxHeight: "50%",
    maxWidth: "60%",
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

export const GetStartedScreen: ScreenType = ({ navigation }: Props) => {
  const { LL } = useI18nContext()
  return (
    <Screen
      style={styles.container}
      backgroundColor={palette.white}
      statusBar="light-content"
    >
      <Image style={styles.Logo} source={PuraVidaLogo} resizeMode="contain" />
      <VersionComponent style={styles.version} />
      <View style={styles.bottom}>
        <Button
          title={LL.GetStartedScreen.getStarted()}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={() => navigation.replace("welcomeFirst")}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.getStarted())}
        />
      </View>
    </Screen>
  )
}
