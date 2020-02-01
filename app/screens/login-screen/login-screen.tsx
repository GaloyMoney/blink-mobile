import { inject, observer } from "mobx-react"
import * as React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { withNavigation } from "react-navigation"
import { Screen } from "../../components/screen"
import { color } from "../../theme"

import VersionNumber from 'react-native-version-number';
import Config from "react-native-config";
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    marginLeft: 0,
    width: "70%",
  },

  buttonContainer: {
    marginVertical: 12,
    width: "100%",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  form: {
    marginHorizontal: 32,
    marginVertical: 12,
  },

  signIn: {
    backgroundColor: color.primary,
  },


  sub: {
    fontSize: 18,
    marginBottom: 48,
  },

  title: {
    color: color.primary,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 128,
  },

  version: {
    fontSize: 18,
    marginTop: 100,
    color: palette.lightGrey,
    textAlign: 'center',
  }
})


export const GetStartedScreen = withNavigation(inject("dataStore")(
    observer(({ dataStore, navigation }) => {

      return (
        <Screen style={styles.container}>
          <Text style={styles.title} onPress={() => navigation.navigate("demo")}>
            Galoy
          </Text>
          <Text style={styles.sub}>{translate("GetStartedScreen.headline")}</Text>
          
          <Text style={styles.version}>
            v{VersionNumber.appVersion} build {VersionNumber.buildVersion}{'\n'}
            network: {Config.BITCOIN_NETWORK}{'\n'}
            lnd: {dataStore.lnd.version}
          </Text>
          <View style={styles.bottom}>
            <Button
              title={translate("GetStartedScreen.getStarted")}
              buttonStyle={styles.signIn}
              onPress={() => navigation.navigate("welcomeFirst")}
              containerStyle={styles.buttonContainer}
            />
          </View>
        </Screen>
      )

    }),
  ),
)

GetStartedScreen.navigationOptions = () => ({
  headerShown: false,
})
