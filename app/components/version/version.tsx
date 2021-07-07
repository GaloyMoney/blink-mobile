import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Pressable, StyleSheet, Text } from "react-native"
import Config from "react-native-config"
import VersionNumber from "react-native-version-number"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
  version: {
    color: palette.darkGrey,
    fontSize: 18,
    marginTop: 18,
    textAlign: "center",
  },
})

export const VersionComponent = ({ style }: { style? }) => {
  const { navigate } = useNavigation()

  const [secretMenuCounter, setSecretMenuCounter] = React.useState(0)
  React.useEffect(() => {
    if (secretMenuCounter > 2) {
      navigate("Profile")
      setSecretMenuCounter(0)
    }
  }, [secretMenuCounter])

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
