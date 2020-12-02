import * as React from "react"
import { ActivityIndicator, Image, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { VersionComponent } from "../../components/version"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { palette } from "../../theme/palette"
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")
import { observer } from "mobx-react"
import { Token } from "../../utils/token"
import VersionNumber from "react-native-version-number"
import { Button } from "react-native-elements"
import { color } from "../../theme"

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

  text: {
    color: palette.lighterGrey,
    fontSize: 18,
    textAlign: "center",
    paddingTop: 18,
    flex: 1,
  },

  button: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "100%",
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
    justifyContent: "center"
  },

})

export const SplashScreen = observer(({ navigation }) => {
  let needUpdate

  // FIXME: no cache doesn't seem to work
  const { error, loading, data, store, setQuery } = useQuery(null, {fetchPolicy: "no-cache"})

  // console.tron.log({loading, error, data})

  const query = () => {
    setQuery(store => store.queryBuildParameters({
      appVersion: String(VersionNumber.appVersion),
      buildVersion: String(VersionNumber.buildVersion),
      os: Platform.OS,
    }, 
    undefined, 
    {fetchPolicy: "no-cache"}
    ))
  }

  React.useEffect(() => query(), [])

  if (!!data) {
    needUpdate = store.isUpdateRequired()
  
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
      <VersionComponent style={{ paddingVertical: 30 }} />
      <View style={{paddingHorizontal: 30, flex: 1, marginVertical: 30}}>
        {loading &&
          <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
        }
        {needUpdate && 
          <Text style={styles.text}>{translate('SplashScreen.update')}</Text>
        }
        {error &&
          <View >
            <Text style={styles.text}>{error.message}</Text>
            <Button
              title={"Try again"}
              buttonStyle={styles.button}
              titleStyle={styles.buttonTitle}
              onPress={query}
              containerStyle={styles.buttonContainer}
              testID={"getStarted"}
            />
          </View>
        }
      </View>
    </ScrollView>
  </SafeAreaView>
)})