import { values } from "mobx"
import * as React from "react"
import { Alert, Modal, Text, View } from "react-native"
import { Divider, Icon, ListItem } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import { resetDataStore } from "../../utils/logout"
import { hasFullPermissions, requestPermission } from "../../utils/notifications"
import { VersionComponent } from "../../components/version"

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
    username={values(store.users)[0].username}
    phone={values(store.users)[0].phone}
    notifications={notificationsEnabled ? translate("SettingsScreen.activated") : translate("SettingsScreen.activate")}  
  />
}

export const SettingsScreenJSX = (params) => {

  const loggedin = params.loggedin

  const [modalVisible, setModalVisible] = React.useState(false)

  const list = [
    {
      title: translate("common.phoneNumber"),
      icon: 'call',
      id: 'phone',
      defaultMessage: translate("SettingsScreen.tapLogIn"),
      action: () => params.navigation.navigate("phoneValidation"),
      enabled: !loggedin,
      greyed: loggedin,
    },
    {
      title: translate("common.username"),
      icon: 'ios-person-circle',
      id: 'username',
      defaultMessage: translate("SettingsScreen.tapUserName"),
      action: () => params.navigation.navigate("setUsernameScreen"),
      enabled: loggedin && !params.username,
      greyed: !loggedin,
    },
    {
      title: translate('common.notification'),
      icon: 'ios-notifications-circle',
      id: 'notifications',
      action: requestPermission,
      enabled: loggedin && params.notifications !== translate("SettingsScreen.activated"),
      greyed: !loggedin,
      styleDivider: { backgroundColor: palette.lighterGrey, height: 18 },
    },
    {
      title: translate('common.logout'), 
      id: "logout",
      icon: 'ios-log-out', 
      action: async () => {
        await resetDataStore()
        setModalVisible(true)
      },
      enabled: loggedin,
      greyed: !loggedin,
    }
  ]
  
  const Component = ({icon, title, id = undefined, i, enabled, greyed, defaultMessage = undefined, action, styleDivider}) => {
    const message = params[id] || defaultMessage

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
      <ListItem key={i} onPress={action} disabled={!enabled}>
        <Icon name={icon} type='ionicon' color={greyed ? palette.midGrey : null} />
        <ListItem.Content>
          <View>
            <ListItem.Title style={greyed ? {color: palette.midGrey} : {}}>{title}</ListItem.Title>
            {message && <ListItem.Title style={greyed ? {color: palette.midGrey} : {}}>{message}</ListItem.Title>}
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