import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem, SearchBar } from "@rneui/base"
import { makeStyles } from "@rneui/themed"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { ContactStackParamList } from "../../navigation/stack-param-lists"
import { color } from "../../theme"
import { testProps } from "../../utils/testProps"
import { toastShow } from "../../utils/toast"

import { gql } from "@apollo/client"
import { useContactsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"

const useStyles = makeStyles((theme) => ({
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
    color: theme.colors.black,
  },

  emptyListTitle: {
    color: theme.colors.black,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  item: {
    marginHorizontal: 32,
    marginVertical: 8,
  },

  itemContainer: { borderRadius: 8, backgroundColor: theme.colors.lighterGreyOrBlack },

  listContainer: { flexGrow: 1 },

  searchBarContainer: {
    backgroundColor: theme.colors.white,
    borderBottomColor: theme.colors.white,
    borderTopColor: theme.colors.white,
    marginHorizontal: 26,
    marginVertical: 8,
  },

  searchBarInputContainerStyle: {
    backgroundColor: theme.colors.lighterGreyOrBlack,
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarText: {
    color: theme.colors.black,
    textDecorationLine: "none",
  },

  itemText: { color: theme.colors.black },

  icon: {
    color: theme.colors.black,
  },
}))

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
  const styles = useStyles()

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
        showLoading={false}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainerStyle}
        inputStyle={styles.searchBarText}
        rightIconContainerStyle={styles.searchBarRightIconStyle}
        searchIcon={<Icon name="search" size={24} color={styles.icon.color} />}
        clearIcon={
          <Icon name="close" size={24} onPress={reset} color={styles.icon.color} />
        }
      />
    )
  } else {
    SearchBarContent = <></>
  }

  if (contacts.length > 0) {
    ListEmptyContent = (
      <View style={styles.emptyListNoMatching}>
        <Text style={styles.emptyListTitle}>
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
          style={styles.emptyListTitle}
        >
          {LL.ContactsScreen.noContactsTitle()}
        </Text>
        <Text style={styles.emptyListText}>{LL.ContactsScreen.noContactsYet()}</Text>
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
            containerStyle={styles.itemContainer}
            onPress={() => navigation.navigate("contactDetail", { contact: item })}
          >
            <Icon name={"ios-person-outline"} size={24} color={color.palette.green} />
            <ListItem.Content>
              <ListItem.Title style={styles.itemText}>{item.alias}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        keyExtractor={(item) => item.username}
      />
    </Screen>
  )
}
