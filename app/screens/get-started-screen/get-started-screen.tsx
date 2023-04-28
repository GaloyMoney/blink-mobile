import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Image, StyleSheet, View } from "react-native"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { testProps } from "../../utils/testProps"

import AppLogo from "./app-logo.png"
import { useNavigation } from "@react-navigation/native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"
import { useFeatureFlags } from "@app/graphql/feature-flags-context"
import useDeviceToken from "./use-device-token"

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
  },

  screen: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  version: { paddingTop: 18 },
})

export const GetStartedScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const { LL } = useI18nContext()

  const { deviceAccountEnabled } = useFeatureFlags()

  const [ deviceToken ] = useDeviceToken({ skip: !deviceAccountEnabled })
  return (
    <Screen style={styles.screen}>
      <Image style={styles.Logo} source={AppLogo} resizeMode="contain" />
      <VersionComponent style={styles.version} />
      <View style={styles.bottom}>
        <GaloyPrimaryButton
          title={LL.GetStartedScreen.createAccount()}
          onPress={() => navigation.navigate("phoneFlow")}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.createAccount())}
        />
        {deviceToken && (
          <GaloyTertiaryButton
            title={LL.GetStartedScreen.startLiteAccount()}
            onPress={() =>
              navigation.replace("liteDeviceAccount", {
                deviceToken,
              })
            }
            {...testProps(LL.GetStartedScreen.startLiteAccount())}
          />
        )}
      </View>
    </Screen>
  )
}
