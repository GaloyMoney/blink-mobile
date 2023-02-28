import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem, SearchBar } from "@rneui/base"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { ContactStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { toastShow } from "../../utils/toast"
import { testProps } from "../../utils/testProps"

import { useContactsQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useNavigation } from "@react-navigation/native"

const styles = EStyleSheet.create({
  activityIndicatorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  emptyListNoContacts: {
    marginHorizontal: 12,
    marginTop: 32,
  },

  emptyListNoMatching: {
    marginHorizontal: 26,
    marginTop: 8,
  },

  emptyListText: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
  },

  emptyListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  item: {
    marginHorizontal: 32,
    marginVertical: 8,
  },

  itemContainer: { borderRadius: 8 },

  listContainer: { flexGrow: 1 },

  searchBarContainer: {
    backgroundColor: color.palette.lighterGrey,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    marginHorizontal: 26,
    marginVertical: 8,
    paddingTop: 8,
  },

  searchBarInputContainerStyle: {
    backgroundColor: color.palette.white,
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarText: {
    color: color.palette.black,
    textDecorationLine: "none",
  },
})

gql`
  query contacts {
    me {
      id
      contacts {
        id
        username
        alias
        transactionsCount
      }
    }
  }
`

export const ContactsScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<ContactStackParamList, "contactList">>()

  const isAuthed = useIsAuthed()

  const [matchingContacts, setMatchingContacts] = useState<Contact[]>([])
  const [searchText, setSearchText] = useState("")
  const { LL } = useI18nContext()
  const { loading, data, error } = useContactsQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-and-network",
  })

  if (error) {
    toastShow({ message: error.message })
  }

  const contacts: Contact[] = useMemo(() => {
    return data?.me?.contacts.slice() ?? []
  }, [data])

  React.useEffect(() => {
    setMatchingContacts(contacts)
  }, [contacts])

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
    let contactPrettyNameMatchesSearchWord

    const contactNameMatchesSearchWord = contact.username
      .toLowerCase()
      .includes(searchWord.toLowerCase())

    if (contact.alias) {
      contactPrettyNameMatchesSearchWord = contact.alias
        .toLowerCase()
        .includes(searchWord.toLowerCase())
    } else {
      contactPrettyNameMatchesSearchWord = false
    }

    return contactNameMatchesSearchWord || contactPrettyNameMatchesSearchWord
  }

  let searchBarContent: React.ReactNode
  let listEmptyContent: React.ReactNode

  if (contacts.length > 0) {
    searchBarContent = (
      <SearchBar
        {...testProps(LL.common.search())}
        placeholder={LL.common.search()}
        value={searchText}
        onChangeText={updateMatchingContacts}
        platform="default"
        round
        lightTheme
        showLoading={false}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainerStyle}
        inputStyle={styles.searchBarText}
        rightIconContainerStyle={styles.searchBarRightIconStyle}
        searchIcon={<Icon name="search" size={24} />}
        clearIcon={<Icon name="close" size={24} onPress={() => setSearchText("")} />}
      />
    )
  } else {
    searchBarContent = <></>
  }

  if (contacts.length > 0) {
    listEmptyContent = (
      <View style={styles.emptyListNoMatching}>
        <Text style={styles.emptyListTitle}>
          {LL.ContactsScreen.noMatchingContacts()}
        </Text>
      </View>
    )
  } else if (loading) {
    listEmptyContent = (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={color.palette.midGrey} />
      </View>
    )
  } else {
    listEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text
          {...testProps(LL.ContactsScreen.noContactsTitle())}
          style={styles.emptyListTitle}
        >
          {LL.ContactsScreen.noContactsTitle()}
        </Text>
        <Text style={styles.emptyListText}>{LL.ContactsScreen.noContactsYet()}</Text>
      </View>
    )
  }

  return (
    <Screen backgroundColor={color.palette.lighterGrey}>
      {searchBarContent}
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={matchingContacts}
        ListEmptyComponent={listEmptyContent}
        renderItem={({ item }) => (
          <ListItem
            key={item.username}
            style={styles.item}
            containerStyle={styles.itemContainer}
            onPress={() => navigation.navigate("contactDetail", { contact: item })}
          >
            <Icon name={"ios-person-outline"} size={24} color={color.palette.green} />
            <ListItem.Content>
              <ListItem.Title>{item.alias}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        keyExtractor={(item) => item.username}
      />
    </Screen>
  )
}
