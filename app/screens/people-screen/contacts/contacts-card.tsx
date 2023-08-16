import { ActivityIndicator, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { toastShow } from "@app/utils/toast"

import { gql } from "@apollo/client"
import { UserContact, useContactsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useMemo } from "react"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { PeopleStackParamList } from "@app/navigation/stack-param-lists"

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

const Contact = ({ contact }: { contact: UserContact }) => {
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()

  return (
    <View style={styles.contactContainer}>
      <Text type="p1">{contact.username}</Text>
      <GaloyIconButton
        onPress={() => navigation.navigate("contactDetail", { contact })}
        name="send"
        size="medium"
        iconOnly
      />
    </View>
  )
}

export const ContactsCard = () => {
  const styles = useStyles()

  const isAuthed = useIsAuthed()

  const { loading, data, error } = useContactsQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-and-network",
  })

  if (error) {
    toastShow({ message: error.message })
  }

  const contacts: Contact[] = useMemo(() => {
    return data?.me?.contacts.slice(0, 3) ?? []
  }, [data])

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.contacts}>
          <Text type="h2">Recent Contacts</Text>
        </View>
        <View style={[styles.separator, styles.spaceTop]}></View>
      </View>
      <View style={styles.contactsOuterContainer}>
        {loading && <ActivityIndicator />}
        {contacts.map((contact) => (
          <Contact key={contact.id} contact={contact as UserContact} />
        ))}
      </View>
      <GaloySecondaryButton title="View all contacts" />
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
