import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem, SearchBar } from "@rneui/base"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { ContactStackParamList } from "../../navigation/stack-param-lists"
import { color, palette } from "../../theme"
import { toastShow } from "../../utils/toast"
import { testProps } from "../../utils/testProps"

import { useContactsQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useNavigation } from "@react-navigation/native"
import { useDarkMode } from "@app/hooks/use-darkmode"

const styles = StyleSheet.create({
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

  emptyListTextLight: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
  },

  emptyListTextDark: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
    color: palette.white,
  },

  emptyListTitleLight: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  emptyListTitleDark: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: palette.white,
  },

  item: {
    marginHorizontal: 32,
    marginVertical: 8,
  },

  itemContainerLight: { borderRadius: 8 },
  itemContainerDark: { borderRadius: 8, backgroundColor: palette.darkGrey },

  listContainer: { flexGrow: 1 },

  searchBarContainerLight: {
    backgroundColor: color.palette.lighterGrey,
    marginHorizontal: 26,
    marginVertical: 8,
  },

  searchBarContainerDark: {
    backgroundColor: color.palette.black,
    marginHorizontal: 26,
    marginVertical: 8,
  },

  searchBarInputContainerStyleLight: {
    backgroundColor: palette.white,
  },

  searchBarInputContainerStyleDark: {
    backgroundColor: palette.black,
    // borderColor: palette.white,
    // borderWidth: 1, // TODO: fix the styles here to show a border outline
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarTextLight: {
    color: color.palette.black,
    textDecorationLine: "none",
  },
  searchBarTextDark: {
    color: color.palette.white,
    textDecorationLine: "none",
  },

  itemTextDark: { color: palette.white },
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
  const darkMode = useDarkMode()

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

  const reset = useCallback(() => {
    setSearchText("")
    setMatchingContacts(contacts)
  }, [contacts])

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
    let contactPrettyNameMatchesSearchWord: boolean

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

  let SearchBarContent: React.ReactNode
  let ListEmptyContent: React.ReactNode

  if (contacts.length > 0) {
    SearchBarContent = (
      <SearchBar
        {...testProps(LL.common.search())}
        placeholder={LL.common.search()}
        value={searchText}
        onChangeText={updateMatchingContacts}
        platform="default"
        round
        lightTheme={!darkMode}
        showLoading={false}
        containerStyle={
          darkMode ? styles.searchBarContainerDark : styles.searchBarContainerLight
        }
        inputContainerStyle={
          darkMode
            ? styles.searchBarInputContainerStyleDark
            : styles.searchBarInputContainerStyleLight
        }
        inputStyle={darkMode ? styles.searchBarTextDark : styles.searchBarTextLight}
        rightIconContainerStyle={styles.searchBarRightIconStyle}
        searchIcon={
          <Icon
            name="search"
            size={24}
            color={darkMode ? palette.white : palette.black}
          />
        }
        clearIcon={
          <Icon
            name="close"
            size={24}
            onPress={reset}
            color={darkMode ? palette.white : palette.black}
          />
        }
      />
    )
  } else {
    SearchBarContent = <></>
  }

  if (contacts.length > 0) {
    ListEmptyContent = (
      <View style={styles.emptyListNoMatching}>
        <Text style={darkMode ? styles.emptyListTitleDark : styles.emptyListTitleLight}>
          {LL.ContactsScreen.noMatchingContacts()}
        </Text>
      </View>
    )
  } else if (loading) {
    ListEmptyContent = (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={color.palette.midGrey} />
      </View>
    )
  } else {
    ListEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text
          {...testProps(LL.ContactsScreen.noContactsTitle())}
          style={darkMode ? styles.emptyListTitleDark : styles.emptyListTitleLight}
        >
          {LL.ContactsScreen.noContactsTitle()}
        </Text>
        <Text style={darkMode ? styles.emptyListTextDark : styles.emptyListTextLight}>
          {LL.ContactsScreen.noContactsYet()}
        </Text>
      </View>
    )
  }

  return (
    <Screen>
      {SearchBarContent}
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={matchingContacts}
        ListEmptyComponent={ListEmptyContent}
        renderItem={({ item }) => (
          <ListItem
            key={item.username}
            style={styles.item}
            containerStyle={
              darkMode ? styles.itemContainerDark : styles.itemContainerLight
            }
            onPress={() => navigation.navigate("contactDetail", { contact: item })}
          >
            <Icon name={"ios-person-outline"} size={24} color={color.palette.green} />
            <ListItem.Content>
              <ListItem.Title style={darkMode && styles.itemTextDark}>
                {item.alias}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        keyExtractor={(item) => item.username}
      />
    </Screen>
  )
}
