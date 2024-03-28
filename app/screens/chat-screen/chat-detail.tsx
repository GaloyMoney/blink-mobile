import "react-native-get-random-values"
import * as React from "react"
import { ActivityIndicator, Image, View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
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
import { PreviewData } from "@flyerhq/react-native-link-preview"
import { launchImageLibrary } from "react-native-image-picker"
import { ChatMessage } from "@app/components/chat-message"
import useNostrProfile from "@app/hooks/use-nostr-profile"
import Icon from "react-native-vector-icons/Ionicons"

type ChatDetailProps = {
  route: RouteProp<ChatStackParamList, "chatDetail">
}

export const ChatDetailScreen: React.FC<ChatDetailProps> = ({ route }) => {
  const { chat } = route.params
  return <ChatDetailScreenJSX chat={chat} />
}

type ChatDetailScreenProps = {
  chat: Chat
}

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === "x" ? r : (r % 4) + 8
    return v.toString(16)
  })
}

export const ChatDetailScreenJSX: React.FC<ChatDetailScreenProps> = ({ chat }) => {
  const {
    theme: { colors },
  } = useTheme()
  const { sendMessage, fetchMessagesWith, nostrPubKey, fetchNostrPubKey } =
    useNostrProfile()
  const styles = useStyles()
  const { name, username, picture } = chat
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const { LL } = useI18nContext()
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])
  const [userId, setUserId] = React.useState<string>("")
  const [initialized, setInitialized] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    let interval: NodeJS.Timeout
    async function initialize() {
      if (!initialized) {
        interval = setInterval(async () => {
          let messageHistory = await fetchMessagesWith(chat.id as `npub1${string}`)
          if (messageHistory.length > messages.length) {
            setMessages(messageHistory as MessageType.Text[])
          }
        }, 10000)
        setUserId(await fetchNostrPubKey())
        setInitialized(true)
        return () => clearInterval(interval)
      }
    }
    initialize()

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const user = { id: nostrPubKey || userId }

  const addMessage = (message: MessageType.Any) => {
    console.log("new meesssage", message, "old messages", messages)
    setMessages([message, ...messages])
  }

  const handleImageSelection = () => {
    launchImageLibrary(
      {
        includeBase64: true,
        maxWidth: 1440,
        mediaType: "photo",
        quality: 0.7,
      },
      ({ assets }) => {
        const response = assets?.[0]

        if (response?.base64) {
          const imageMessage: MessageType.Image = {
            author: user,
            createdAt: Date.now(),
            height: response.height,
            id: uuidv4(),
            name: response.fileName ?? response.uri?.split("/").pop() ?? "🖼",
            size: response.fileSize ?? 0,
            type: "image",
            uri: `data:image/*;base64,${response.base64}`,
            width: response.width,
          }
          addMessage(imageMessage)
        }
      },
    )
  }

  const handleSendPress = async (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: user.id,
      text: message.text,
      type: "text",
    }
    await sendMessage(chat.id, message.text)
    addMessage(textMessage)
  }

  return (
    <Screen unsafe>
      <View style={styles.aliasView}>
        <Icon
          name="arrow-back-outline"
          onPress={navigation.goBack}
          style={styles.backButton}
        />
        <Text type="p1">{name || username}</Text>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <GaloyIconButton
            name={"lightning"}
            size="large"
            //text={LL.HomeScreen.pay()}
            style={{ marginRight: 5 }}
            onPress={() =>
              navigation.navigate("sendBitcoinDestination", {
                username: chat.lud16,
              })
            }
          />
          <Image
            source={{
              uri:
                picture ||
                "https://pfp.nostr.build/520649f789e06c2a3912765c0081584951e91e3b5f3366d2ae08501162a5083b.jpg",
            }}
            style={styles.userPic}
          />
        </View>
      </View>
      {!initialized && <ActivityIndicator />}
      <View style={styles.chatBodyContainer}>
        <View style={styles.chatView}>
          <Chat
            messages={messages}
            onAttachmentPress={handleImageSelection}
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
            showUserAvatars={true}
            user={user}
            renderTextMessage={(message, nextMessage, prevMessage) => (
              <ChatMessage
                message={message}
                recipientId={chat.id as `npub1${string}`}
                nextMessage={nextMessage}
                prevMessage={prevMessage}
              />
            )}
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
  },
}))
