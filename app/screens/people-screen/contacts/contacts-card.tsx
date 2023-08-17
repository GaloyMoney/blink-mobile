import { ActivityIndicator, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { toastShow } from "@app/utils/toast"

import { gql } from "@apollo/client"
import {
  ContactsCardQuery,
  UserContact,
  useContactsCardQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useMemo } from "react"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import {
  PeopleStackParamList,
  RootStackParamList,
} from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"

gql`
  query ContactsCard {
    me {
      id
      contacts {
        id
        username
        alias
        transactionsCount
        transactions(first: 1) {
          edges {
            node {
              createdAt
            }
          }
        }
      }
    }
  }
`

const Contact = ({ contact }: { contact: UserContact }) => {
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()
  const rootNavigation = navigation.getParent<StackNavigationProp<RootStackParamList>>()

  return (
    <View style={styles.contactContainer}>
      <Text type="p1">{contact.username}</Text>
      <GaloyIconButton
        onPress={() =>
          rootNavigation.navigate("sendBitcoinDestination", {
            username: contact.username,
          })
        }
        name="send"
        size="medium"
        iconOnly
      />
    </View>
  )
}

export const ContactsCard = () => {
  const styles = useStyles()

  const { LL } = useI18nContext()

  const isAuthed = useIsAuthed()
  const navigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()

  const { loading, data, error } = useContactsCardQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-and-network",
  })

  if (error) {
    toastShow({ message: error.message })
  }

  const contacts = useMemo(() => (data ? getRecentContacts(data) : []), [data])

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.contacts}>
          <Text type="h2">{LL.PeopleScreen.recentContacts()}</Text>
        </View>
        <View style={[styles.separator, styles.spaceTop]}></View>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : contacts.length === 0 ? (
        <Text type="p2">{LL.PeopleScreen.noContactsTitle()}</Text>
      ) : (
        <>
          <View style={styles.contactsOuterContainer}>
            {contacts.map((contact) => (
              <Contact key={contact.id} contact={contact as UserContact} />
            ))}
          </View>
          <GaloySecondaryButton
            title={LL.PeopleScreen.viewAllContacts()}
            onPress={() => navigation.navigate("allContacts")}
          />
        </>
      )}
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    rowGap: 14,
  },
  contacts: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: colors.grey4,
  },
  spaceTop: {
    marginTop: 8,
  },
  textCenter: {
    textAlign: "center",
  },
  contactsOuterContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 10,
  },
  contactContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 3,
  },
}))

// ---- HELPERS ----
const getRecentContacts = (data: ContactsCardQuery) => {
  // Extract the contacts
  const _contacts = data?.me?.contacts || []
  const contacts = [..._contacts] // Convert from readyonlyarray to regular array

  // Sort contacts by the `createdAt` timestamp in descending order
  contacts.sort((a, b) => {
    if (a.transactions?.edges && b.transactions?.edges) {
      const aDate = a?.transactions?.edges[0]?.node?.createdAt || 0
      const bDate = b?.transactions?.edges[0]?.node?.createdAt || 0
      return bDate - aDate
    }
    return 0
  })

  // return top 3
  return contacts.slice(0, 3)
}
