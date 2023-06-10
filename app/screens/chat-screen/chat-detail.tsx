import "react-native-get-random-values"
import * as React from "react"
import { Image, View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import type {
  ChatStackParamList,
  RootStackParamList,
} from "../../navigation/stack-param-lists"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { isIos } from "@app/utils/helper"

// Code from Flyer.chat
import { Chat, MessageType, defaultTheme } from "@flyerhq/react-native-chat-ui"
import { PreviewData } from "@flyerhq/react-native-link-preview"
import { launchImageLibrary } from "react-native-image-picker"

// Code for NOSTR data
import NDK, { NDKUser } from "@nostr-dev-kit/ndk"
import { ChatMessage } from "@app/components/chat-message"

type ChatDetailProps = {
  route: RouteProp<ChatStackParamList, "chatDetail">
}

export const ChatDetailScreen: React.FC<ChatDetailProps> = ({ route }) => {
  const { chat } = route.params
  chat.nsec = "90c3b9ef8c1d20df7b90ae1a5216361aac414c64c0dbbb4cfbedd744fe6d5a06"
  return <ChatDetailScreenJSX chat={chat} />
}

type ChatDetailScreenProps = {
  chat: Chat
}

/* Beginning of drop-in flyer.chat code */
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

  // new state variable for user profile data
  const [recipientProfile, setRecipientProfile] = React.useState<NDKUser>()
  const [userName, setUserName] = React.useState<string>("")
  const [userPic, setUserPic] = React.useState<string>("")
  const [senderProfile, setSenderProfile] = React.useState<NDKUser>()
  const [senderNsec, setSenderNsec] = React.useState<string>("")

  React.useEffect(() => {
    let isMounted = true

    // Connect to nostr
    const ndk = new NDK({
      explicitRelayUrls: [
        "wss://nostr.pleb.network",
        "wss://relay.damuas.io",
        "wss://purplepag.es",
        "wss://relay.n057r.club",
        "wss://nostr-pub.wellorder.net",
      ],
    })
    ndk
      .connect()
      .then(() => {
        console.log("Connected to NOSTR")
      })
      .catch((error) => {
        console.log("Error connecting to NOSTR ", error)
      })
    const nostrSender = ndk.getUser({
      npub: "npub1u6c0pgwxmymtxac284n29wytuj27t5gjgag67e2784msgd0rrv8qhflash",
    })
    const nostrSenderNsec =
      "90c3b9ef8c1d20df7b90ae1a5216361aac414c64c0dbbb4cfbedd744fe6d5a06"

    const nostrRecipient = ndk.getUser({
      npub: "npub1qqqqqq0u2gj96tdfvqymdqn739k4s0h9rzdwyegfmalv28j7a5ssh5ntu2",
    })
    nostrRecipient
      .fetchProfile()
      .then(() => {
        // set userName state
        if (isMounted && nostrRecipient.profile?.name) {
          // check if component is still mounted
          setUserName(nostrRecipient.profile?.name)
        }
        // set userPic state
        if (isMounted && nostrRecipient.profile?.image) {
          // check if component is still mounted
          setUserPic(nostrRecipient.profile?.image)
        }
        // set recipientProfile state
        if (isMounted && nostrRecipient.npub) {
          // check if component is still mounted
          setRecipientProfile(nostrRecipient)
        }
        // set senderProfile state
        if (isMounted && nostrSender.npub) {
          // check if component is still mounted
          setSenderProfile(nostrSender)
        }
        // set senderNsec state
        if (isMounted && nostrSenderNsec) {
          // check if component is still mounted
          setSenderNsec(nostrSenderNsec)
        }
      })
      .catch((error) => {
        console.error("Error fetching NOSTR profile: ", error)
      })

    return () => {
      isMounted = false
    } // clean up function to set isMounted to false when unmounting
  }, [])

  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const { LL } = useI18nContext()
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])
  const user = { id: recipientProfile?.hexpubkey() || "0" }

  const addMessage = (message: MessageType.Any) => {
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

  const handlePreviewDataFetched = ({
    message,
    previewData,
  }: {
    message: MessageType.Text
    previewData: PreviewData
  }) => {
    setMessages(
      messages.map<MessageType.Any>((m) =>
        m.id === message.id ? { ...m, previewData } : m,
      ),
    )
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: "text",
    }
    addMessage(textMessage)
  }

  return (
    <Screen unsafe>
      <View style={styles.aliasView}>
        <Image
          source={
            userPic ? { uri: userPic } : require("../../assets/logo/blink-logo-icon.png")
          }
          style={styles.userPic}
        />
        <Text type="p1">{userName || chat.username}</Text>
      </View>
      <View style={styles.chatBodyContainer}>
        <View style={styles.chatView}>
          <Chat
            messages={messages}
            onAttachmentPress={handleImageSelection}
            onPreviewDataFetched={handlePreviewDataFetched}
            onSendPress={handleSendPress}
            user={user}
            renderTextMessage={(message, nextMessage, prevMessage) => (
              <ChatMessage
                message={message}
                sender={senderProfile}
                seckey={senderNsec}
                recipient={recipientProfile}
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
        <View style={styles.actionsContainer}>
          <GaloyIconButton
            name={"dollar"}
            size="large"
            text={LL.HomeScreen.pay()}
            onPress={() =>
              navigation.navigate("sendBitcoinDestination", {
                username: chat.username,
              })
            }
          />
        </View>
      </View>
      <CloseCross color={colors.black} onPress={navigation.goBack} />
    </Screen>
  )
  /* End of drop-in flyer.chat code */
}

const useStyles = makeStyles(() => ({
  actionsContainer: {
    margin: 12,
  },

  alias: {
    fontSize: 36,
  },

  aliasView: {
    alignItems: "center",
    paddingBottom: 6,
    paddingTop: isIos ? 40 : 10,
  },

  chatBodyContainer: {
    flex: 1,
  },

  inputContainer: {
    flexDirection: "row",
  },

  inputStyle: {
    textAlign: "center",
    textDecorationLine: "underline",
  },

  screenTitle: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 18,
  },

  chatView: {
    flex: 1,
    marginHorizontal: 30,
    borderRadius: 24,
    overflow: "hidden",
  },

  userPic: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
}))
