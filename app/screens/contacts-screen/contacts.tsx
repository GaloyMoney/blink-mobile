import { observer } from "mobx-react"
import * as React from "react"
import { View } from "react-native"
import { Avatar, ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"


const styles = EStyleSheet.create({

})

export const ContactsScreen = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)
  console.tron.log({store})
  return <ContactsScreenJSX list={store.user.contacts} navigation={navigation} />
})

export const ContactsScreenJSX = ({ list, navigation }) => {

  return (
  <Screen backgroundColor={"white"}>
    <View>
      {
        list.map((l, i) => (
          <ListItem key={i} bottomDivider 
            onPress={() => navigation.navigate("sendBitcoin", {username: l})}>
            <Avatar source={{uri: l.avatar_url}} />
            <ListItem.Content>
              <ListItem.Title>{l}</ListItem.Title>
              {/* <ListItem.Subtitle>{l.id}</ListItem.Subtitle> */}
            </ListItem.Content>
          </ListItem>
        ))
      }
    </View>
  </Screen>
)}
