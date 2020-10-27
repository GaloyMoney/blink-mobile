import * as React from "react"
import { Pressable, View } from "react-native"
import { Divider, Icon, ListItem } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  screenStyle: {
    backgroundColor: palette.lighterGrey
  },

})

// export const SettingsScreen = ({}) => {
//   return <SettingsScreenJSX  />
// }

export const SettingsScreenJSX = (params) => {

  const loggedin = params.loggedin

  const list = [
    {
      title: 'Phone number',
      icon: 'call',
      id: 'phone',
      needLoggedIn: false,
      defaultMessage: "Tap to log in",
      action: () => params.navigate.navigation("welcomePhoneInput"),
      chevron: !loggedin,
    },
    {
      title: 'Username',
      icon: 'ios-person-circle',
      id: 'username',
      needLoggedIn: true,
      defaultMessage: "Tap to set username",
      action: () => {},
      chevron: !params.username,
    },
    {
      title: 'Notifications',
      icon: 'ios-notifications-circle',
      id: 'notifications',
      needLoggedIn: true,
      action: () => {},
      chevron: loggedin,
    },
  ]
  
  const logOut = {
    title: 'Log Out', 
    icon: 'ios-log-out', 
    needLoggedIn: true,
    i: 99, 
    action: () => {},
    chevron: loggedin,
  }

  const Component = ({icon, title, id = undefined, i, needLoggedIn, defaultMessage = undefined, action, chevron}) => {
    const enabled = (loggedin || !needLoggedIn)

    return (
    <ListItem key={i} bottomDivider onPress={action} disabled={!enabled}>
      <Icon name={icon} type='ionicon' />
      <ListItem.Content>
        <View>
          <ListItem.Title style={enabled ? {} : {color: palette.midGrey}}>{title}</ListItem.Title>
          {id && enabled ? <ListItem.Title>{params[id] || defaultMessage}</ListItem.Title> : null}
        </View>
      </ListItem.Content>
      {chevron && <ListItem.Chevron />}
    </ListItem>
  )}

  return (
  <Screen preset="scroll">
    <View>
      {list.map((item, i) => <Component {...item} i={i} />)}
    </View>
    <Divider style={{ backgroundColor: palette.lighterGrey, height: 18 }} />
    <Component {...logOut} />
  </Screen>
)}