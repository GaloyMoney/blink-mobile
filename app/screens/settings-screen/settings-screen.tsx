import * as React from "react"
import { Alert, Modal, Text, View } from "react-native"
import { Divider, Icon, ListItem } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { resetDataStore } from "../../utils/logout"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"
import { language_mapping } from "./language-screen"

const styles = EStyleSheet.create({
  screenStyle: {
    backgroundColor: palette.lighterGrey
  },
})

export const SettingsScreen = ({navigation}) => {
  const store = React.useContext(StoreContext)

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)

  React.useEffect(() => {
    const fn = async () => {
      setNotificationsEnabled(await hasFullPermissions())
    }

    fn()
  }, [])

  return <SettingsScreenJSX 
    loggedin={store.walletIsActive}
    navigation={navigation} 
    username={store.user.username}
    phone={store.user.phone}
    language={language_mapping[store.user.language]}
    notifications={notificationsEnabled ? translate("SettingsScreen.activated") : translate("SettingsScreen.activate")}  
    notificationsEnabled={notificationsEnabled}
    csvAction={store.csvExport}
  />
}


// username / phone not working

export const SettingsScreenJSX = (params) => {

  const loggedin = params.loggedin

  const [modalVisible, setModalVisible] = React.useState(false)

  const list = [{
      category: translate("common.phoneNumber"),
      icon: 'call',
      id: 'phone',
      defaultValue: translate("SettingsScreen.tapLogIn"),
      action: () => params.navigation.navigate("phoneValidation"),
      enabled: !loggedin,
      greyed: loggedin,
    },
    {
      category: translate("common.username"),
      icon: 'ios-person-circle',
      id: 'username',
      defaultValue: translate("SettingsScreen.tapUserName"),
      action: () => params.navigation.navigate("setUsername"),
      enabled: loggedin && !params.username,
      greyed: !loggedin,
    },
    {
      category: translate('common.language'),
      icon: 'ios-language',
      id: 'language',
      action: () => params.navigation.navigate("language"),
      enabled: loggedin,
      greyed: !loggedin,
    },
    {
      category: translate('common.notification'),
      icon: 'ios-notifications-circle',
      id: 'notifications',
      action: requestPermission,
      enabled: loggedin && params.notificationsEnabled,
      greyed: !loggedin,
    },
    {
      category: translate('common.csvExport'),
      icon: 'ios-download',
      id: 'csv',
      action: () => params.csvAction(),
      enabled: loggedin,
      greyed: !loggedin,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
    {
      category: translate('common.logout'), 
      id: "logout",
      icon: 'ios-log-out', 
      action: async () => {
        await resetDataStore()
        setModalVisible(true)
      },
      enabled: loggedin,
      greyed: !loggedin,
  }]
  
  const Component = ({icon, category, id, i, enabled, greyed, defaultValue = undefined, action, styleDivider}) => {
    const value = params[id] || defaultValue

    console.tron.log({id, value})

    return (
      <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={{alignItems: "center", justifyContent: "center", flex: 1, padding: 30}} >
          <Text>{translate("SettingsScreen.logOutSuccesful")}</Text>
        </View>
      </Modal>
      <ListItem id={i} onPress={action} disabled={!enabled}>
        <Icon name={icon} type='ionicon' color={greyed ? palette.midGrey : null} />
        <ListItem.Content>
          <View>
            <ListItem.Title style={greyed ? {color: palette.midGrey} : {}}>{category}</ListItem.Title>
            {value && <ListItem.Title style={greyed ? {color: palette.midGrey} : {}}>{value}</ListItem.Title>}
          </View>
        </ListItem.Content>
        {enabled && <ListItem.Chevron />}
      </ListItem>
      <Divider style={styleDivider}/>
    </>
  )}

  return (
  <Screen preset="scroll">
    {list.map((item, i) => <Component {...item} i={i} />)}
    <VersionComponent />
  </Screen>
)}