import * as React from "react"
import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { testProps } from "../../utils/testProps"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
// import { ChatDiscussions } from "./chat-discussions"

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

gql`
  mutation userChatUpdateAlias($input: UserChatUpdateAliasInput!) {
    userChatUpdateAlias(input: $input) {
      errors {
        message
      }
      chat {
        alias
        id
      }
    }
  }
`

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

  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const { LL } = useI18nContext()
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])
  const user = { id: "06c33e8b-e835-4736-80f4-63f44b66666c" }

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
        <Icon
          {...testProps("chat-detail-icon")}
          name="ios-person-outline"
          size={86}
          color={colors.black}
        />
        <Text type="p1">{`${chat.username}`}</Text>
      </View>
      <View style={styles.chatBodyContainer}>
        <View style={styles.chatView}>
          <Chat
            messages={messages}
            onAttachmentPress={handleImageSelection}
            onPreviewDataFetched={handlePreviewDataFetched}
            onSendPress={handleSendPress}
            user={user}
            theme={{
              ...defaultTheme,
              colors: {
                ...defaultTheme.colors,
                inputBackground: colors._black,
                background: colors._lightGrey,
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
}))
