import { Observer, observer } from "mobx-react"
import * as React from "react"
import { Text, View } from "react-native"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { FlatList } from "react-native-gesture-handler"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import Icon from "react-native-vector-icons/Ionicons"


const styles = EStyleSheet.create({

})

export const ContactsScreen = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)
  return <ContactsScreenJSX navigation={navigation} />
})

export const ContactsScreenJSX = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)
  
  // not sure why it's necessary, but component doesn't update 
  // without a reference to store.contacts
  console.tron.log(JSON.stringify(store.contacts))
  
  return (
  <Screen backgroundColor={palette.lighterGrey}>
    <Observer>{() => 
      <FlatList
      style={{paddingTop: 18}}
      data={store.user.contactsSorted.slice()}
      ListEmptyComponent={() => 
        <View style={{marginHorizontal: 12, marginTop: 32}}>
          <Text style={{fontSize: 18}}>{"No contact yet.\n\nSend or receive payment with a username. Usernames will automatically be added here."}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ListItem 
          underlayColor={palette.lighterGrey}
          activeOpacity={0.7}
          style={{ marginHorizontal: 32, marginVertical: 8 }}
          containerStyle={{borderRadius: 8}}
          onPress={() => navigation.navigate("contactDetail", {contactId: item.id})}>
          {/* <Avatar source={{uri: .avatar_url}} /> */}
          <Icon name={"ios-person-outline"} size={24} color={palette.green} />
          <ListItem.Content>
            <ListItem.Title>{item.prettyName}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      )}
      keyExtractor={(item) => item.id}
      />
    }</Observer>
  </Screen>
)})
