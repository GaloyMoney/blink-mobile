import { gql } from "@apollo/client"
import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
import { Text, View, FlatList } from "react-native"
import { ChatMessage } from "../../components/chat-message"
import { toastShow } from "../../utils/toast"
import NDK from "@nostr-dev-kit/ndk"

import { useTransactionListForContactQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
// import { groupTransactionsByDate } from "@app/graphql/transactions"
import { makeStyles } from "@rneui/themed"

gql`
  query transactionListForContact(
    $username: Username!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      contactByUsername(username: $username) {
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
`

type Props = {
  contactUsername: string
}

type ChatMessage = {
  id: string
  content: string
  sender: string
  timestamp: string
}

export const ndk = new NDK({
  explicitRelayUrls: [
    "wss://nostr.pleb.network",
    "wss://purplepag.es",
    "wss://relay.damus.io",
  ],
})

ndk.connect().then(() => {
  console.log("connected to NOSTR")
})

export const ChatDiscussions = ({ contactUsername }: Props) => {
  const [fetchError, setFetchError] = React.useState<null | string>(null)
  const [messages, setMessages] = React.useState([])
  const styles = useStyles()
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const { error, data } = useTransactionListForContactQuery({
    variables: { username: contactUsername },
    skip: !isAuthed,
  })

  const transactions = data?.me?.contactByUsername?.transactions

  const fetchChatMessages = React.useCallback(async () => {
    try {
      const response = await fetch(
        `https://nostr-server-url/messages?username=${contactUsername}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      return data.messages || []
    } catch (error) {
      if (error instanceof Error) {
        setFetchError(error.message)
      } else {
        setFetchError("An unknown error occurred")
      }
      return []
    }
  }, [contactUsername])

  React.useEffect(() => {
    fetchChatMessages().then((fetchedMessages) => {
      setMessages(fetchedMessages)
    })
  }, [fetchChatMessages])

  if (error) {
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  }

  if (!transactions) {
    return <></>
  }

  if (fetchError) {
    return (
      <View style={styles.screen}>
        <Text>Error fetching messages: {fetchError}</Text>
      </View>
    )
  }

  const renderChatMessage = ({ item }: { item: ChatMessage }) => {
    return <ChatMessage {...item} />
  }

  return (
    <View style={styles.screen}>
      {/* create an interactive chat thread between myself and contactUsername */}
      {messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={renderChatMessage}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View style={styles.noTransactionView}>
          <Text style={styles.noTransactionText}>
            The discussion has not started yet, make the link!
          </Text>
        </View>
      )}
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  noTransactionText: {
    fontSize: 24,
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: 48,
  },

  screen: {
    flex: 1,
    borderRadius: 10,
    borderColor: colors.grey4,
    borderWidth: 2,
    overflow: "hidden",
  },

  sectionHeaderContainer: {
    backgroundColor: colors.grey5,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  sectionHeaderText: {
    color: colors.black,
    fontSize: 18,
  },
}))
