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
import { Chat, MessageType, defaultTheme } from "@flyerhq/react-native-chat-ui"
import { PreviewData } from "@flyerhq/react-native-link-preview"
import { launchImageLibrary } from "react-native-image-picker"
import NDK, { NDKUser } from "@nostr-dev-kit/ndk"
import { ChatMessage } from "@app/components/chat-message"
import useNostrProfile from "@app/hooks/use-nostr-profile"
import { getPublicKey, nip19 } from "nostr-tools"

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
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const { LL } = useI18nContext()
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])
  const [userProfile, setUserProfile] = React.useState<NDKUser>()

  React.useEffect(() => {
    let isMounted = true
    const ndk = new NDK({
      explicitRelayUrls: [
        "wss://nos.lol",
        "wss://no.str.cr",
        "wss://purplepag.es",
        "wss://nostr.mom",
      ],
    })

    const nostrRecipient = ndk.getUser({
      npub: "npub1067y35l9rfxczuvm0swkq87k74ds36pawv0zak384tx9g09urpqqkflash",
    })

    const connectToNostr = async () => {
      try {
        await ndk.connect()
        console.log("Connected to NOSTR")
        await nostrRecipient.fetchProfile()
        if (isMounted) {
          setUserProfile(nostrRecipient)
        }
      } catch (error) {
        console.log("Error connecting to NOSTR ", error)
      }
    }
    connectToNostr()
    return () => {
      isMounted = false
    }
  }, [])

  const user = { id: userProfile?.npub || "" }

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
            userProfile?.profile?.image
              ? { uri: userProfile?.profile?.image }
              : require("../../assets/logo/blink-logo-icon.png")
          }
          style={styles.userPic}
        />
        <Text type="p1">{userProfile?.profile?.name || chat.username}</Text>
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
                recipient={userProfile}
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
            // onPress={() =>
            //   navigation.navigate("sendBitcoinDestination", {
            //     username: chat.name || null,
            //   })
            // }
          />
        </View>
      </View>
      <CloseCross color={colors.black} onPress={navigation.goBack} />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  actionsContainer: {
    margin: 12,
  },
  aliasView: {
    alignItems: "center",
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
    width: 125,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: colors.green,
    marginTop: 10,
  },
}))
