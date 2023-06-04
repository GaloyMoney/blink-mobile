import * as React from "react"
import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import { useUserContactUpdateAliasMutation } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { testProps } from "../../utils/testProps"
import { CloseCross } from "../../components/close-cross"
import { Screen } from "../../components/screen"
import { ChatDiscussions } from "./chat-discussions"

import type {
  ChatStackParamList,
  RootStackParamList,
} from "../../navigation/stack-param-lists"
import { makeStyles, Text, useTheme, Input } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { isIos } from "@app/utils/helper"

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

export const ChatDetailScreenJSX: React.FC<ChatDetailScreenProps> = ({ chat }) => {
  const {
    theme: { colors },
  } = useTheme()

  const styles = useStyles()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "transactionHistory">>()

  const [contactName, setChatName] = React.useState(chat.alias)
  const { LL } = useI18nContext()

  // TODO: feature seems broken. need to fix.
  const [userChatUpdateAlias] = useUserContactUpdateAliasMutation({})

  const updateName = async () => {
    // TODO: need optimistic updates
    // FIXME this one doesn't work
    if (contactName) {
      await userChatUpdateAlias({
        variables: { input: { username: chat.username, alias: contactName } },
      })
    }
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
        <View style={styles.inputContainer}>
          <Input
            style={styles.alias}
            inputStyle={styles.inputStyle}
            inputContainerStyle={{ borderColor: colors.black }}
            onChangeText={setChatName}
            onSubmitEditing={updateName}
            onBlur={updateName}
            returnKeyType="done"
          >
            {chat.alias}
          </Input>
        </View>
        {/* <Text type="p1">{`${LL.common.username()}: ${chat.username}`}</Text> */}
      </View>
      <View style={styles.chatBodyContainer}>
        <View style={styles.transactionsView}>
          <Text style={styles.screenTitle}>
            {LL.ChatDetailsScreen.title({
              username: chat.alias || chat.username,
            })}
          </Text>
          <ChatDiscussions contactUsername={chat.username} />
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

  transactionsView: {
    flex: 1,
    marginHorizontal: 30,
  },
}))
