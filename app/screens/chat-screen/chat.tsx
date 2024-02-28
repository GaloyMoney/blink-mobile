import { StackNavigationProp } from "@react-navigation/stack"
import { SearchBar } from "@rneui/base"
import { ListItem, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Text, View, Image } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { ChatStackParamList } from "../../navigation/stack-param-lists"
import { testProps } from "../../utils/testProps"
import { toastShow } from "../../utils/toast"

import { gql } from "@apollo/client"
import { useContactsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import useNostrProfile from "@app/hooks/use-nostr-profile"

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

export const ChatScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { fetchNostrUser } = useNostrProfile()
  const navigation = useNavigation<StackNavigationProp<ChatStackParamList, "chatList">>()

  const isAuthed = useIsAuthed()

  const [matchingContacts, setMatchingContacts] = useState<Contact[]>([])
  const [nostrProfiles, setNostrProfiles] = useState<NostrProfile[]>([])
  const [searchText, setSearchText] = useState("")
  const [refreshing, setRefreshing] = useState(false)
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
  const updateSearchResults = useCallback(
    async (newSearchText: string) => {
      setRefreshing(true)
      setSearchText(newSearchText)
      setNostrProfiles([])
      setMatchingContacts([])
      if (newSearchText.startsWith("npub1") && newSearchText.length == 63) {
        try {
          let nostrProfile = await fetchNostrUser(newSearchText as `npub1${string}`)
          setNostrProfiles(nostrProfile ? [nostrProfile] : [])
        } catch (e) {
          console.log("Error fetching nostr profile", e)
        }
        setRefreshing(false)
        return
      }
      setMatchingContacts([])
      setNostrProfiles([])
      try {
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
      } catch (e) {
        console.log("Error is ", e)
      } finally {
        setRefreshing(false)
      }
    },
    [contacts],
  )

  const NostrProfilesToChat = () => {
    return nostrProfiles.map((profile) => {
      return {
        id: profile.pubkey,
        name: profile.name,
        alias: profile.nip05,
        username: profile.nip05,
        picture: profile.picture,
      }
    })
  }
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
        {...testProps(LL.common.chatSearch())}
        placeholder={LL.common.chatSearch()}
        value={searchText}
        onChangeText={updateSearchResults}
        platform="default"
        round
        showLoading={refreshing}
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
    SearchBarContent = (
      <SearchBar
        {...testProps(LL.common.chatSearch())}
        placeholder={LL.common.chatSearch()}
        value={searchText}
        onChangeText={updateSearchResults}
        platform="default"
        round
        showLoading={refreshing}
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
  }

  if (contacts.length > 0) {
    ListEmptyContent = (
      <View style={styles.emptyListNoMatching}>
        <Text style={styles.emptyListTitle}>{LL.ChatScreen.noMatchingChats()}</Text>
        <Text style={styles.emptyListText}>{LL.ChatScreen.noChatsYet()}</Text>
      </View>
    )
  } else if (loading) {
    ListEmptyContent = (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  } else {
    ListEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text {...testProps(LL.ChatScreen.noChatsTitle())} style={styles.emptyListTitle}>
          {LL.ChatScreen.noChatsTitle()}
        </Text>
        <Text style={styles.emptyListText}>{LL.ChatScreen.noChatsYet()}</Text>
      </View>
    )
  }

  return (
    <Screen style={styles.header}>
      {SearchBarContent}
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={NostrProfilesToChat() as Chat[]}
        ListEmptyComponent={ListEmptyContent}
        renderItem={({ item }) => (
          <ListItem
            key={item.id}
            style={styles.item}
            containerStyle={styles.itemContainer}
            onPress={() =>
              navigation.navigate("chatDetail", {
                chat: { ...item, transactionsCount: 0 },
              })
            }
          >
            <Image source={{ uri: item.picture || "" }} style={styles.profilePicture} />
            <ListItem.Content>
              <ListItem.Title style={styles.itemText}>{item.alias}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        keyExtractor={(item) => item.id}
      />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  header: {
    backgroundColor: colors.white,
  },

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
    color: colors.black,
  },

  emptyListTitle: {
    color: colors.black,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  item: {
    marginHorizontal: 32,
    marginVertical: 8,
  },

  itemContainer: {
    borderRadius: 8,
    backgroundColor: colors.grey5,
  },

  listContainer: { flexGrow: 1 },

  searchBarContainer: {
    backgroundColor: colors.white,
    borderBottomColor: colors.white,
    borderTopColor: colors.white,
    marginHorizontal: 26,
    marginVertical: 8,
  },

  searchBarInputContainerStyle: {
    backgroundColor: colors.grey5,
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarText: {
    color: colors.black,
    textDecorationLine: "none",
  },

  itemText: { color: colors.black },

  icon: {
    color: colors.black,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: colors.black,
  },
}))
