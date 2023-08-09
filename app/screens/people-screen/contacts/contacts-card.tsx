import { ActivityIndicator, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { toastShow } from "@app/utils/toast"

import { gql } from "@apollo/client"
import { useContactsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useMemo } from "react"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"

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

const Contact = ({ username }: { username: string }) => {
  const styles = useStyles()

  return (
    <View>
      <View style={styles.contactContainer}>
        <Text type="p1">{username}</Text>
        <GaloyIconButton name="send" size="medium" iconOnly />
      </View>
      <View style={styles.separator}></View>
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
          <Text type="h2">Contacts</Text>
        </View>
        <View style={[styles.separator, styles.spaceTop]}></View>
      </View>
      <View style={styles.contactsOuterContainer}>
        {loading && <ActivityIndicator />}
        {contacts.map(({ username }) => (
          <Contact key={username} username={username} />
        ))}
      </View>
      <GaloySecondaryButton title="View and manage contacts" />
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
    paddingBottom: 6,
  },
}))
