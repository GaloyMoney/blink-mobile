import { observer } from "mobx-react"
import * as React from "react"
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Toast from "react-native-root-toast"
import { VersionComponent } from "../../components/version"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { Token } from "../../utils/token"
import { connectionIssue } from "../move-money-screen"
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")

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

  const { error, loading, data, store, setQuery } = useQuery()

  const [afterFirstLoading, setAfterFirstLoading] = React.useState(false)

  const query = () => {
    setQuery(store => store.mainQuery())
  }

  React.useEffect(() => query(), [])

  if(loading && !afterFirstLoading) {
    setAfterFirstLoading(true)
  } 
    
  if (!loading && afterFirstLoading) {
    needUpdate = store.isUpdateRequired
  
    console.tron.log({needUpdate})

    if (!needUpdate) {
      const token = new Token()
      if (token.has()) {
        navigation.replace("Primary")
      } else {
        navigation.replace("getStarted")
      }
    }
  }

  // TODO: refactor. use a reusable useEffect for that.
  React.useEffect(() => {
    if (connectionIssue(error) === true) {
      Toast.show(translate("common.connectionIssue"), {
        duration: Toast.durations.LONG,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 500,
        position: 160,
        opacity: 1,
        backgroundColor: palette.red,
      })
    }
  }, [connectionIssue(error)])

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
      </View>
    </ScrollView>
  </SafeAreaView>
)})