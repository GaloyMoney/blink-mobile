import { SearchBar } from "@rneui/base"
import { useTheme } from "@rneui/themed"
import * as React from "react"
import { useCallback, useState } from "react"
import { ActivityIndicator, Text, View, Alert } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { testProps } from "../../utils/testProps"

import { useI18nContext } from "@app/i18n/i18n-react"
import { Event, SubCloser, getPublicKey, nip05, nip19 } from "nostr-tools"
import {
  convertRumorsToGroups,
  fetchNostrUsers,
  fetchSecretFromLocalStorage,
  getGroupId,
} from "@app/utils/nostr"
import { useStyles } from "./style"
import { SearchListItem } from "./searchListItem"
import { HistoryListItem } from "./historyListItem"
import { useChatContext } from "./chatContext"
import { useFocusEffect } from "@react-navigation/native"
import { useAppConfig } from "@app/hooks"
import { useAppSelector } from "@app/store/redux"
import { ImportNsecModal } from "./import-nsec"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useHomeAuthedQuery } from "@app/graphql/generated"

export const NIP17Chat: React.FC = () => {
  const styles = useStyles()
  const { appConfig } = useAppConfig()
  const {
    theme: { colors },
  } = useTheme()
  const isAuthed = useIsAuthed()

  const { data: dataAuthed } = useHomeAuthedQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  })
  const { rumors, poolRef, addEventToProfiles, profileMap, resetChat } = useChatContext()
  const [searchText, setSearchText] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [searchedUsers, setSearchedUsers] = useState<Chat[]>([])
  const [privateKey, setPrivateKey] = useState<Uint8Array>()
  const [showImportModal, setShowImportModal] = useState<boolean>(false)
  const [skipMismatchCheck, setskipMismatchCheck] = useState<boolean>(false)
  const { LL } = useI18nContext()
  const { userData } = useAppSelector((state) => state.user)

  const reset = useCallback(() => {
    setSearchText("")
    setSearchedUsers([])
    setRefreshing(false)
    setskipMismatchCheck(true)
  }, [])

  const searchedUsersHandler = (event: Event, closer: SubCloser) => {
    let nostrProfile = JSON.parse(event.content)
    addEventToProfiles(event)
    let userPubkey = getPublicKey(privateKey!)
    let participants = [event.pubkey, userPubkey]
    setSearchedUsers([
      { ...nostrProfile, id: event.pubkey, groupId: getGroupId(participants) },
    ])
    closer.close()
  }

  React.useEffect(() => {
    const unsubscribe = () => {
      console.log("unsubscribing")
      setInitialized(false)
    }
    async function initialize() {
      console.log("Initializing nip17 screen use effect")
      let secretKeyString = await fetchSecretFromLocalStorage()
      if (!secretKeyString) {
        console.log("Couldn't find secret key in local storage")
        setShowImportModal(true)
        return
      }
      let secret = nip19.decode(secretKeyString).data as Uint8Array
      setPrivateKey(secret)
      const accountNpub = dataAuthed?.me?.npub
      const storedNpub = nip19.npubEncode(getPublicKey(secret))
      if (!skipMismatchCheck && accountNpub && storedNpub !== accountNpub) {
        console.log("Account Info mismatch", accountNpub, storedNpub)
        setShowImportModal(true)
      }
      setInitialized(true)
    }
    if (!initialized && poolRef) initialize()
    return unsubscribe
  }, [poolRef, isAuthed])

  useFocusEffect(
    React.useCallback(() => {
      async function checkSecretKey() {
        let secretKeyString = await fetchSecretFromLocalStorage()
        if (!secretKeyString) {
          console.log("No secret on focus effect", secretKeyString)
          setShowImportModal(true)
          return
        }
        let secret = nip19.decode(secretKeyString).data as Uint8Array
        const accountNpub = dataAuthed?.me?.npub
        const storedNpub = nip19.npubEncode(getPublicKey(secret))
        if (!skipMismatchCheck && accountNpub && storedNpub !== accountNpub) {
          setShowImportModal(true)
        }
      }
      if (initialized) {
        setSearchText("")
        setSearchedUsers([])
        checkSecretKey()
      }
    }, [setSearchText, setSearchedUsers, dataAuthed, isAuthed, skipMismatchCheck]),
  )

  const updateSearchResults = useCallback(
    async (newSearchText: string) => {
      const nip05Matching = async (alias: string) => {
        let nostrUser = await nip05.queryProfile(alias.toLocaleLowerCase())
        console.log("nostr user for", alias, nostrUser)
        if (nostrUser) {
          let nostrProfile = profileMap?.get(nostrUser.pubkey)
          let userPubkey = getPublicKey(privateKey!)
          let participants = [nostrUser.pubkey, userPubkey]
          setSearchedUsers([
            {
              id: nostrUser.pubkey,
              username: alias,
              ...nostrProfile,
              groupId: getGroupId(participants),
            },
          ])
          if (!nostrProfile)
            fetchNostrUsers([nostrUser.pubkey], poolRef!.current, searchedUsersHandler)
          return true
        }
        return false
      }
      const aliasPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
      if (!privateKey) {
        Alert.alert("User Profile not yet loaded")
        return
      }
      if (!newSearchText) {
        setRefreshing(false)
      }
      setRefreshing(true)
      setSearchText(newSearchText)
      if (newSearchText.startsWith("npub1") && newSearchText.length == 63) {
        let hexPubkey = nip19.decode(newSearchText).data as string
        let userPubkey = getPublicKey(privateKey)
        let participants = [hexPubkey, userPubkey]
        setSearchedUsers([{ id: hexPubkey, groupId: getGroupId(participants) }])
        fetchNostrUsers([hexPubkey], poolRef!.current, searchedUsersHandler)
        setRefreshing(false)
        return
      } else if (newSearchText.match(aliasPattern)) {
        if (await nip05Matching(newSearchText)) {
          setRefreshing(false)
          return
        }
      } else if (!newSearchText.includes("@")) {
        let modifiedSearchText =
          newSearchText + "@" + appConfig.galoyInstance.lnAddressHostname
        console.log("Searching for", modifiedSearchText)
        if (await nip05Matching(modifiedSearchText)) {
          setRefreshing(false)
          return
        }
      }
    },
    [privateKey],
  )

  let SearchBarContent: React.ReactNode
  let ListEmptyContent: React.ReactNode

  SearchBarContent = (
    <SearchBar
      {...testProps(LL.common.chatSearch())}
      placeholder={LL.common.chatSearch()}
      value={searchText}
      onChangeText={updateSearchResults}
      platform="default"
      round
      showLoading={refreshing && !!searchText}
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

  if (!initialized) {
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

  let groups = convertRumorsToGroups(rumors || [])
  let groupIds = Array.from(groups.keys()).sort((a, b) => {
    let groupARumors = groups.get(a) || []
    let groupBRumors = groups.get(b) || []
    let lastARumor = groupARumors[groupARumors.length ? groupARumors.length - 1 : 0]
    let lastBRumor = groupBRumors[groupBRumors.length ? groupBRumors.length - 1 : 0]
    return (lastBRumor?.created_at || 0) - (lastARumor?.created_at || 0)
  })

  return (
    <Screen style={{ ...styles.header, flex: 1 }}>
      {privateKey && !showImportModal ? (
        <View style={{ flex: 1 }}>
          {SearchBarContent}

          {searchText ? (
            <FlatList
              contentContainerStyle={styles.listContainer}
              data={searchedUsers}
              ListEmptyComponent={ListEmptyContent}
              renderItem={({ item }) => (
                <SearchListItem item={item} userPrivateKey={privateKey!} />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  marginTop: 20,
                  marginLeft: 20,
                  color: colors.primary3,
                }}
              >
                Chats
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  margin: 10,
                  marginLeft: 20,
                  color: colors.primary3,
                }}
              >
                signed in as:{" "}
                <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                  {userData?.username || nip19.npubEncode(getPublicKey(privateKey))}
                </Text>
              </Text>
              <FlatList
                contentContainerStyle={styles.listContainer}
                data={groupIds}
                ListEmptyComponent={ListEmptyContent}
                scrollEnabled={true}
                renderItem={({ item }) => {
                  return (
                    <HistoryListItem
                      item={item}
                      userPrivateKey={privateKey!}
                      groups={groups}
                    />
                  )
                }}
                keyExtractor={(item) => item}
              />
            </View>
          )}
        </View>
      ) : (
        <Text>Loading your nostr keys...</Text>
      )}
      <ImportNsecModal
        isActive={showImportModal}
        onCancel={() => {
          setShowImportModal(false)
        }}
        onSubmit={() => {
          resetChat()
        }}
      />
    </Screen>
  )
}
