import * as React from "react"
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { VersionComponent } from "../../components/version"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")


const styles = StyleSheet.create({
  centerBackground: {
    alignItems: "center",
    backgroundColor: palette.lightBlue,
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
    backgroundColor: palette.lightBlue,
  },

  Logo: {
    maxHeight: 300,
    maxWidth: 310,
    marginTop: 32,
  },

  bottom: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  text: {
    color: palette.lighterGrey,
    fontSize: 18,
    textAlign: "center",
  },
})

export const SplashScreen = ({ route, error }) => {
  const needUpdate = route?.params?.needUpdate ?? false

  return (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{alignItems: "center"}}>
      <Image
        style={styles.Logo}
        source={BitcoinBeachLogo}
      />
      <VersionComponent style={{ paddingVertical: 30 }} />
      <View style={{paddingHorizontal: 30}}>
        {!needUpdate &&
          <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
        }
        {needUpdate && 
          <Text style={styles.text}>{translate('SplashScreen.update')}</Text>
        }
        {error && 
          <Text style={styles.text}>{error.message}</Text>
        }
      </View>
    </ScrollView>
  </SafeAreaView>
)}