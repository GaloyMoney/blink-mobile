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

import AppLogo from "./app-logo.png"

const styles = StyleSheet.create({
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

export const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const { LL } = useI18nContext()
  return (
    <Screen style={styles.container}>
      <Image style={styles.Logo} source={AppLogo} resizeMode="contain" />
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
