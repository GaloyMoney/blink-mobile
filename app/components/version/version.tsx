import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Pressable, StyleProp, StyleSheet, Text, TextStyle } from "react-native"
import DeviceInfo from "react-native-device-info"
import { palette } from "../../theme/palette"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "../../utils/testProps"

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

export const VersionComponent = ({ style }: { style?: StyleProp<TextStyle> }) => {
  const { navigate } = useNavigation<VersionComponentNavigationProp>()
  const { LL } = useI18nContext()
  const [secretMenuCounter, setSecretMenuCounter] = React.useState(0)
  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigate("Debug")
      setSecretMenuCounter(0)
    }
  }, [navigate, secretMenuCounter])

  const readableVersion = DeviceInfo.getReadableVersion()

  return (
    <Pressable onPress={() => setSecretMenuCounter(secretMenuCounter + 1)}>
      <Text {...testProps("Version Build Text")} style={[styles.version, style]}>
        {readableVersion}
        {"\n"}
        {/* network: {Config.BITCOIN_NETWORK} TODO */}
        {/* FIXME should be a props */}
        {LL.GetStartedScreen.headline()}
      </Text>
    </Pressable>
  )
}
