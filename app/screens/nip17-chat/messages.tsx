import "react-native-get-random-values"
import * as React from "react"
import { ActivityIndicator, Image, Platform, View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Screen } from "../../components/screen"
import type {
  ChatStackParamList,
  RootStackParamList,
} from "../../navigation/stack-param-lists"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { isIos } from "@app/utils/helper"
import { Chat, MessageType, defaultTheme } from "@flyerhq/react-native-chat-ui"
import { ChatMessage } from "./chatMessage"
import Icon from "react-native-vector-icons/Ionicons"
import { getPublicKey, Event, nip19, SubCloser } from "nostr-tools"
import {
  Rumor,
  convertRumorsToGroups,
  fetchNostrUsers,
  fetchPreferredRelays,
  sendNip17Message,
} from "@app/utils/nostr"
import { useEffect, useState } from "react"
import { useChatContext } from "./chatContext"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { updateLastSeen } from "./utils"
import { hexToBytes } from "@noble/hashes/utils"

type MessagesProps = {
  route: RouteProp<ChatStackParamList, "messages">
}

export const Messages: React.FC<MessagesProps> = ({ route }) => {
  let userPubkey = getPublicKey(hexToBytes(route.params.userPrivateKey))
  let groupId = route.params.groupId
  const { poolRef } = useChatContext()
  const [profileMap, setProfileMap] = useState<Map<string, NostrProfile>>()
  const [preferredRelaysMap, setPreferredRelaysMap] = useState<Map<string, string[]>>()

  function handleProfileEvent(event: Event) {
    let profile = JSON.parse(event.content)
    setProfileMap((profileMap) => {
      let newProfileMap = profileMap || new Map<string, Object>()
      newProfileMap.set(event.pubkey, profile)
      return newProfileMap
    })
  }

  useEffect(() => {
    let closer: SubCloser
    if (poolRef) {
      closer = fetchNostrUsers(groupId.split(","), poolRef.current, handleProfileEvent)
      fetchPreferredRelays(groupId.split(","), poolRef.current).then(
        (relayMap: Map<string, string[]>) => {
          setPreferredRelaysMap(relayMap)
        },
      )
    }
    return () => {
      if (closer) closer.close()
    }
  }, [groupId, poolRef])

  return (
    <MessagesScreen
      userPubkey={userPubkey}
      groupId={route.params.groupId}
      profileMap={profileMap}
      preferredRelaysMap={preferredRelaysMap}
    />
  )
}

type MessagesScreenProps = {
  groupId: string
  userPubkey: string
  profileMap?: Map<string, NostrProfile>
  preferredRelaysMap?: Map<string, string[]>
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  userPubkey,
  groupId,
  profileMap,
  preferredRelaysMap,
}) => {
  const {
    theme: { colors },
  } = useTheme()
  let { rumors, poolRef } = useChatContext()
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const { LL } = useI18nContext()
  const [initialized, setInitialized] = React.useState(false)
  const [messages, setMessages] = useState<Map<string, MessageType.Text>>(new Map())

  const user = { id: userPubkey }

  const convertRumorsToMessages = (rumors: Rumor[]) => {
    let chatSet: Map<string, MessageType.Text> = new Map<string, MessageType.Text>()
    ;(rumors || []).forEach((r: Rumor) => {
      chatSet.set(r.id, {
        author: { id: r.pubkey },
        createdAt: r.created_at * 1000,
        id: r.id,
        type: "text",
        text: r.content,
      })
    })
    return chatSet
  }

  React.useEffect(() => {
    let isMounted = true
    async function initialize() {
      if (poolRef) setInitialized(true)
    }
    if (!initialized) initialize()
    let chatRumors = convertRumorsToGroups(rumors).get(groupId)
    const lastRumor = (chatRumors || []).sort((a, b) => b.created_at - a.created_at)[0]
    if (lastRumor) updateLastSeen(groupId, lastRumor.created_at)
    let newChatMap = new Map([...messages, ...convertRumorsToMessages(chatRumors || [])])
    setMessages(newChatMap)
    return () => {
      isMounted = false
    }
  }, [poolRef, rumors])

  const handleSendPress = async (message: MessageType.PartialText) => {
    let textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      text: message.text,
      type: "text",
      id: message.text,
    }
    let sent = false
    let onSent = (rumor: Rumor) => {
      console.log("OnSent")
      if (!sent) {
        console.log("On sent setting")
        textMessage.id = rumor.id
        setMessages((prevChat) => {
          let newChatMap = new Map(prevChat)
          newChatMap.set(textMessage.id, textMessage)
          return newChatMap
        })
        sent = true
      }
    }
    let result = await sendNip17Message(
      groupId.split(","),
      message.text,
      preferredRelaysMap || new Map<string, string[]>(),
      onSent,
    )
    console.log("Output is", result)
    if (
      result.outputs.filter((output) => output.acceptedRelays.length !== 0).length === 0
    ) {
      console.log("inside errored message")
      textMessage.metadata = { errors: true }
      textMessage.id = result.rumor.id

      setMessages((prevChat) => {
        let newChatMap = new Map(prevChat)
        newChatMap.set(textMessage.id, textMessage)
        return newChatMap
      })
    }
    console.log("setting message with metadata", textMessage)
  }

  return (
    <Screen>
      <View style={styles.aliasView} key="profileView">
        <Icon
          name="arrow-back-outline"
          onPress={navigation.goBack}
          style={styles.backButton}
          key="backButton"
        />
        <Text type="p1" key="displayname">
          {groupId
            .split(",")
            .filter((p) => p !== userPubkey)
            .map((user) => {
              return (
                profileMap?.get(user)?.name ||
                profileMap?.get(user)?.username ||
                profileMap?.get(user)?.lud16 ||
                nip19.npubEncode(user).slice(0, 9) + ".."
              )
            })
            .join(", ")}
        </Text>
        <View style={{ display: "flex", flexDirection: "row" }} key="header">
          <GaloyIconButton
            name={"lightning"}
            size="medium"
            //text={LL.HomeScreen.pay()}
            style={{ margin: 5 }}
            onPress={() => {
              let ids = groupId.split(",")
              let recipientId = ids.filter((id) => id !== userPubkey)[0]
              navigation.navigate("sendBitcoinDestination", {
                username: profileMap?.get(recipientId)?.lud16,
              })
            }}
            key="lightning-button"
          />
          {groupId
            .split(",")
            .filter((p) => p !== userPubkey)
            .map((pubkey) => {
              return (
                <Image
                  source={{
                    uri:
                      profileMap?.get(pubkey)?.picture ||
                      "https://pfp.nostr.build/520649f789e06c2a3912765c0081584951e91e3b5f3366d2ae08501162a5083b.jpg",
                  }}
                  style={styles.userPic}
                  key="profile-picture"
                />
              )
            })}
        </View>
      </View>
      {!initialized && <ActivityIndicator />}
      <View style={styles.chatBodyContainer} key="chatContainer">
        <View style={styles.chatView} key="chatView">
          <SafeAreaProvider>
            <Chat
              messages={Array.from(messages.values()).sort((a, b) => {
                return b.createdAt! - a.createdAt!
              })}
              key="messages"
              onPreviewDataFetched={() => {}}
              onSendPress={handleSendPress}
              l10nOverride={{
                emptyChatPlaceholder: initialized
                  ? isIos
                    ? "No messages here yet"
                    : "..."
                  : isIos
                  ? "Fetching Messages..."
                  : "...",
              }}
              user={user}
              renderBubble={({ child, message, nextMessageInGroup }) => {
                return (
                  <View
                    style={{
                      backgroundColor:
                        userPubkey === message.author.id ? "#8fbc8f" : "white",
                      borderRadius: 15,
                      overflow: "hidden",
                    }}
                  >
                    {child}
                  </View>
                )
              }}
              renderTextMessage={(message, nextMessage, prevMessage) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  recipientId={userPubkey}
                  nextMessage={nextMessage}
                  prevMessage={prevMessage}
                />
              )}
              flatListProps={{
                contentContainerStyle: {
                  paddingTop: messages.size ? (Platform.OS == "ios" ? 50 : 0) : 100,
                },
              }}
              theme={{
                ...defaultTheme,
                colors: {
                  ...defaultTheme.colors,
                  inputBackground: colors._black,
                  background: colors._lightGrey,
                },
                fonts: {
                  ...defaultTheme.fonts,
                  sentMessageBodyTextStyle: {
                    ...defaultTheme.fonts.sentMessageBodyTextStyle,
                    fontSize: 12,
                  },
                },
              }}
            />
          </SafeAreaProvider>
        </View>
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  actionsContainer: {
    margin: 12,
  },
  aliasView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
    paddingLeft: 10,
    paddingBottom: 6,
    paddingTop: isIos ? 40 : 10,
  },
  chatBodyContainer: {
    flex: 1,
  },
  chatView: {
    flex: 1,
    marginHorizontal: 30,
    borderRadius: 24,
    overflow: "hidden",
  },
  userPic: {
    borderRadius: 50,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderColor: colors.green,
  },
  backButton: {
    fontSize: 26,
    color: colors.primary3,
  },
}))
