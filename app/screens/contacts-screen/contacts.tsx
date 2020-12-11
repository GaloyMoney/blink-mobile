import { observer } from "mobx-react"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import { Avatar, ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { FlatList } from "react-native-gesture-handler"
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"


const styles = EStyleSheet.create({

})

export const ContactsScreen = observer(({ navigation }) => {
  const store = React.useContext(StoreContext)
  return <ContactsScreenJSX list={store.user.contacts} navigation={navigation} />
})

export const ContactsScreenJSX = ({ list, navigation }) => {

  return (
  <Screen backgroundColor={"white"}>
    <FlatList
      data={list}
      ListHeaderComponent={() => 
      <View style={{marginHorizontal: 12, marginTop: 32}}>
        <Text style={{fontSize: 18}}>{"No contact yet.\n\nSend or receive payment with a username. They'll automatically be added here."}</Text>
      </View>}
      renderItem={({ item }) => (
        <ListItem bottomDivider onPress={() => navigation.navigate("sendBitcoin", {username: item.username})}>
          {/* <Avatar source={{uri: .avatar_url}} /> */}
          <ListItem.Content>
            <ListItem.Title>{item.username}</ListItem.Title>
            {/* <ListItem.Subtitle>{l.id}</ListItem.Subtitle> */}
          </ListItem.Content>
        </ListItem>
      )}
      keyExtractor={(item) => item.id}
    />
  </Screen>
)}
