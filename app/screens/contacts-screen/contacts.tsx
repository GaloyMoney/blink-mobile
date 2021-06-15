import * as React from "react"
import { useState } from "react"
import { Text, View } from "react-native"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
<<<<<<< HEAD
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { useQuery, gql } from "@apollo/client"
=======
import { TextInput, FlatList } from "react-native-gesture-handler"
import { InputSearch } from "../../components/input-search"
>>>>>>> add search bar to contacts screen
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  emptyList: { marginHorizontal: 12, marginTop: 32 },

  emptyListTitle: { fontSize: 18 },

  item: { marginHorizontal: 32, marginVertical: 8 },

  itemContainer: { borderRadius: 8 },

  list: { paddingTop: 18 },
})

type Props = {
  navigation: Record<string, any>
}

export const ContactsScreen = ({ navigation }: Props) => {
  const { data } = useQuery(gql`
    query contacts {
      me {
        contacts {
          id
          name
          prettyName @client
          transactionsCount
        }
      }
    }
  `)

  const contacts = data?.me?.contacts ?? []
  const [matchingContacts, setMatchingContacts] = useState(contacts)

  const updateMatchingContacts = (searchText: String) => {
    if (searchText) {
      let splitSearchText = searchText.split(" ").filter(text => text.trim().length > 0)
      let matchingContacts = contacts.filter((contact) => {
        return searchTextArrayMatchesContact(splitSearchText, contact)
      })
      setMatchingContacts(matchingContacts)
    } else {
      setMatchingContacts(contacts)
    }
  }

  const searchTextArrayMatchesContact = (searchTextArray: String[], contact) => {
    return searchTextArray.some((searchWord) => {
      return searchWordMatchesContact(searchWord, contact)
    })
  }

  const searchWordMatchesContact = (searchWord: String, contact) => {
    let contactNameMatchesSearchWord
    let contactPrettyNameMatchesSearchWord

    if (contact.name === null) {
      contactNameMatchesSearchWord = false
    } else {
      contactNameMatchesSearchWord = contact.name.toLowerCase().includes(searchWord.toLocaleLowerCase())
    }

    if (contact.prettyName === null) {
      contactPrettyNameMatchesSearchWord = false
    } else {
      contactPrettyNameMatchesSearchWord = contact.prettyName.toLowerCase().includes(searchWord.toLocaleLowerCase())
    }

    return contactNameMatchesSearchWord || contactPrettyNameMatchesSearchWord
  }

  let searchBarContent
  let listEmptyContent

  if (contacts.length > 0) {
    searchBarContent = (
      <View style={{paddingTop: 8}}>
        <InputSearch
          onUpdateText={text => updateMatchingContacts(text)}
        />
      </View>
    )
  } else {
    searchBarContent = (null)
  }

  if (contacts.length > 0) {
    listEmptyContent = (
      <View style={{marginHorizontal: 26, marginTop: 8}}>
        <Text style={{fontSize: 18}}>{translate("ContactsScreen.noMatchingContacts")}</Text>
      </View>
    )
  } else {
    listEmptyContent = (
      <View style={{marginHorizontal: 12, marginTop: 32}}>
        <Text style={{fontSize: 18}}>{translate("ContactsScreen.noContactsYet")}</Text>
      </View>
    )
  }

  return (
  <Screen backgroundColor={palette.lighterGrey}>
      {searchBarContent}
      <FlatList
      data={matchingContacts}
      ListEmptyComponent={() => 
        listEmptyContent
      }
      renderItem={({ item }) => (
        <ListItem 
          underlayColor={palette.lighterGrey}
          activeOpacity={0.7}
          style={{ marginHorizontal: 32, marginVertical: 8 }}
          containerStyle={{borderRadius: 8}}
          onPress={() => navigation.navigate("contactDetail", {contact: item})}>
          {/* <Avatar source={{uri: .avatar_url}} /> */}
          <Icon name={"ios-person-outline"} size={24} color={palette.green} />
          <ListItem.Content>
            <ListItem.Title>{item.prettyName}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      )}
      keyExtractor={(item) => item.id}
      />
    </Screen>
  )
}
