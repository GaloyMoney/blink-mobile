import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Pressable, StyleSheet, Text } from "react-native"
import VersionNumber from "react-native-version-number"
import { palette } from "../../theme/palette"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { TextStyleProp } from "react-native/Libraries/StyleSheet/StyleSheet"
import type { ComponentType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { translate } from "@app/utils/translate"

const styles = StyleSheet.create({
  version: {
    color: palette.darkGrey,
    fontSize: 18,
    marginTop: 18,
    textAlign: "center",
  },
})

type VersionComponentNavigationProp = StackNavigationProp<
  RootStackParamList,
  "getStarted" | "settings"
>

export const VersionComponent: ComponentType = ({ style }: { style?: TextStyleProp }) => {
  const { navigate } = useNavigation<VersionComponentNavigationProp>()

  const [secretMenuCounter, setSecretMenuCounter] = React.useState(0)
  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigate("Profile")
      setSecretMenuCounter(0)
    }
  }, [navigate, secretMenuCounter])

  return (
    <Pressable onPress={() => setSecretMenuCounter(secretMenuCounter + 1)}>
      <Text style={[styles.version, style]}>
        v{VersionNumber.appVersion} build {VersionNumber.buildVersion}
        {"\n"}
        {/* network: {Config.BITCOIN_NETWORK} TODO */}
        {/* FIXME should be a props */}
        {translate("GetStartedScreen.headline")}
      </Text>
    </Pressable>
  )
}
