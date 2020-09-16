import * as React from "react"
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { VersionComponent } from "../../components/version"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { palette } from "../../theme/palette"
import { isIos } from "../../utils/helper"
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")
import { observer } from "mobx-react"
import DeviceInfo from 'react-native-device-info';
import { Token } from "../../utils/token"

const styles = StyleSheet.create({
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
    paddingTop: 18,
    flex: 1,
  },
})

export const SplashScreen = observer(({ navigation }) => {

  let needUpdate
  const { error, loading, data } = useQuery(store => store.queryBuildParameters())

  const needUpdateFn = (buildParameters) => {
    const {minBuildNumberAndroid, minBuildNumberIos } = buildParameters
    const minBuildNumber = isIos ? minBuildNumberIos : minBuildNumberAndroid
    let buildNumber = DeviceInfo.getBuildNumber();
    console.log({buildNumber, minBuildNumber})
    return buildNumber < minBuildNumber
  }

  if (!!data) {
    needUpdate = needUpdateFn(data.buildParameters)
  
    if (!needUpdate) {
      const token = new Token()
      if (token.has()) {
          navigation.navigate("Primary")
        } else {
          navigation.navigate("getStarted")
      }
    }
  }

  return (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{alignItems: "center"}} style={{backgroundColor: palette.lightBlue}}>
      <Image
        style={styles.Logo}
        source={BitcoinBeachLogo}
      />
      <View style={{paddingHorizontal: 30, flex: 1, marginVertical: 30}}>
        {loading &&
          <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
        }
        {needUpdate && 
          <Text style={styles.text}>{translate('SplashScreen.update')}</Text>
        }
        {error && 
          <Text style={styles.text}>{error.message}</Text>
        }
      </View>
      <VersionComponent style={{ paddingVertical: 30 }} />
    </ScrollView>
  </SafeAreaView>
)})