import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Image, StyleSheet, View } from "react-native"
import { Button } from "@rneui/base"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { testProps } from "../../utils/testProps"

import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"
import AppLogoImage from "./app-logo.png"

import { useTheme } from "@rneui/themed"

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonTitle: {
    color: palette.white,
    fontWeight: "bold",
  },

  screen: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  version: { paddingTop: 18 },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "getStarted">
}

export const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme()
  const AppLogo = theme.mode === "dark" ? AppLogoDarkMode : AppLogoLightMode
    

  const { LL } = useI18nContext()
  return (
    <Screen style={styles.screen}>
      {/* <AppLogo width={"100%"} height={"60%"} /> */}
      <Image style={{ maxHeight: "50%", maxWidth: "60%", }} source={AppLogoImage} resizeMode="contain" />
      <VersionComponent style={styles.version} />
      <View style={styles.bottom}>
        <Button
          title={LL.GetStartedScreen.getStarted()}
          titleStyle={styles.buttonTitle}
          onPress={() => navigation.replace("Primary")}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.getStarted())}
        />
      </View>
    </Screen>
  )
}
