import { gql, useQuery } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { Text, View } from "react-native"
import {
  ListItem,
  SearchBar,
  SearchBarAndroidProps,
  SearchBarDefaultProps,
  SearchBarIosProps,
} from "react-native-elements"
import { SearchBarBaseProps } from "react-native-elements/dist/searchbar/SearchBar"
import EStyleSheet from "react-native-extended-stylesheet"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { ContactStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { ScreenType } from "../../types/jsx"

// TODO: get rid of this wrapper once SearchBar props are figured out ref: https://github.com/react-native-elements/react-native-elements/issues/3089
const SafeSearchBar = SearchBar as unknown as React.FC<
  SearchBarBaseProps | SearchBarDefaultProps | SearchBarAndroidProps | SearchBarIosProps
>

const styles = EStyleSheet.create({
  emptyListNoContacts: {
    marginHorizontal: 12,
    marginTop: 32,
  },

  emptyListNoMatching: {
    marginHorizontal: 26,
    marginTop: 8,
  },

  emptyListTitle: {
    fontSize: 18,
  },

  item: {
    marginHorizontal: 32,
    marginVertical: 8,
  },

  itemContainer: { borderRadius: 8 },

  searchBarContainer: {
    backgroundColor: palette.lighterGrey,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    marginHorizontal: 26,
    marginVertical: 8,
    paddingTop: 8,
  },

  searchBarInputContainerStyle: {
    backgroundColor: palette.white,
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarText: {
    color: palette.black,
    textDecorationLine: "none",
  },
})

type Props = {
  navigation: StackNavigationProp<ContactStackParamList, "Contacts">
}

type Contact = {
  id: string
  name: string
  prettyName: string
  transactionsCount: string
}

export const ContactsScreen: ScreenType = ({ navigation }: Props) => {
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

  const contacts: Contact[] = useMemo(() => data?.me?.contacts ?? [], [data])
  const [matchingContacts, setMatchingContacts] = useState(contacts)
  const [searchText, setSearchText] = useState("")

  // This implementation of search will cause a match if any word in the search text
  // matches the contacts name or prettyName.
  const updateMatchingContacts = useCallback(
    (newSearchText: string) => {
      setSearchText(newSearchText)
      if (newSearchText.length > 0) {
        const searchWordArray = newSearchText
          .split(" ")
          .filter((text) => text.trim().length > 0)

        const matchingContacts = contacts.filter((contact) =>
          searchWordArray.some((word) => wordMatchesContact(word, contact)),
        )

        setMatchingContacts(matchingContacts)
      } else {
        setMatchingContacts(contacts)
      }
    },
    [contacts],
  )

  const wordMatchesContact = (searchWord: string, contact: Contact): boolean => {
    let contactNameMatchesSearchWord
    let contactPrettyNameMatchesSearchWord

    if (contact.name === null) {
      contactNameMatchesSearchWord = false
    } else {
      contactNameMatchesSearchWord = contact.name
        .toLowerCase()
        .includes(searchWord.toLowerCase())
    }

    if (contact.prettyName === null) {
      contactPrettyNameMatchesSearchWord = false
    } else {
      contactPrettyNameMatchesSearchWord = contact.prettyName
        .toLowerCase()
        .includes(searchWord.toLowerCase())
    }

    return contactNameMatchesSearchWord || contactPrettyNameMatchesSearchWord
  }

  let searchBarContent: JSX.Element
  let listEmptyContent: JSX.Element

  if (contacts.length > 0) {
    searchBarContent = (
      <SafeSearchBar
        placeholder={translate("common.search")}
        onChangeText={updateMatchingContacts}
        value={searchText}
        platform="default"
        round
        lightTheme
        showCancel={false}
        showLoading={false}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainerStyle}
        inputStyle={styles.searchBarText}
        rightIconContainerStyle={styles.searchBarRightIconStyle}
      />
    )
  } else {
    searchBarContent = null
  }

  if (contacts.length > 0) {
    listEmptyContent = (
      <View style={styles.emptyListNoMatching}>
        <Text style={styles.emptyListTitle}>
          {translate("ContactsScreen.noMatchingContacts")}
        </Text>
      </View>
    )
  } else {
    listEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text style={styles.emptyListTitle}>
          {translate("ContactsScreen.noContactsYet")}
        </Text>
      </View>
    )
  }

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      {searchBarContent}
      <FlatList
        data={matchingContacts}
        ListEmptyComponent={() => listEmptyContent}
        renderItem={({ item }) => (
          <ListItem
            underlayColor={palette.lighterGrey}
            activeOpacity={0.7}
            style={styles.item}
            containerStyle={styles.itemContainer}
            onPress={() => navigation.navigate("contactDetail", { contact: item })}
          >
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
