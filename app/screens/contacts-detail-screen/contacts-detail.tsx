import { useApolloClient, useMutation, useQuery, gql } from "@apollo/client"
import * as React from "react"
import { View } from "react-native"
import { Input, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import _ from "lodash"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { translate } from "../../i18n"
import { QUERY_TRANSACTIONS } from "../../graphql/query"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  amount: {
    color: palette.white,
    fontSize: "40rem",
  },

  amountSecondary: {
    color: palette.white,
    fontSize: "16rem",
  },

  amountView: {
    alignItems: "center",
    paddingBottom: "24rem",
    paddingTop: "48rem",
  },

  buttonStyle: {
    backgroundColor: palette.orange,
    borderRadius: 32,
    marginVertical: 18,
    width: "50%",
  },

  transactionsView: {
    flex: 1,
    marginHorizontal: "30rem",
  },
})

export const ContactsDetailScreen = ({ route, navigation }) => {
  const { contact } = route.params
  let transactions_filtered = []
  const { data } = useQuery(QUERY_TRANSACTIONS)

  try {
    const { transactions } = _.find(data.wallet, { id: "BTC" })
    // TODO: this query could be optimize through some graphql query
    transactions_filtered = transactions.filter((tx) => tx.username === contact.id)
  } catch (err) {
    // do not throw if there is a username mismatch. the value from me.contact.name is currently
    // handled on the backend, and there could be some discrepencies, ie: if a username get manually renamed
    // (which should not happen in a normal workflow)
    console.error({ err })
  }

  return (
    <ContactsDetailScreenJSX
      navigation={navigation}
      contact={contact}
      transactions={transactions_filtered}
    />
  )
}

export const ContactsDetailScreenJSX = ({ contact, navigation, transactions }) => {
  const [contactName, setContactName] = React.useState(contact.prettyName)

  const UPDATE_NAME = gql`
    mutation setName($username: String, $name: String) {
      updateContact {
        setName(username: $username, name: $name)
      }
    }
  `

  const [updateNameMutation] = useMutation(UPDATE_NAME)

  const updateName = () => {
    // TODO: need optimistic updates
    // FIXME this one doesn't work
    updateNameMutation({ variables: { username: contact.id, name: contactName } })
  }

  return (
    <Screen style={styles.screen} unsafe>
      <View style={[styles.amountView, { backgroundColor: palette.green }]}>
        <Icon name="ios-person-outline" size={94} color={palette.white} style={{ margin: 0 }} />
        <View style={{ flexDirection: "row" }}>
          <Input
            style={styles.amount}
            inputStyle={{ textAlign: "center", textDecorationLine: "underline" }}
            inputContainerStyle={{ borderColor: palette.green }}
            onChangeText={setContactName}
            onSubmitEditing={updateName}
            onBlur={updateName}
            returnKeyType="done"
          >
            {contact.prettyName}
          </Input>
        </View>
        <Text style={styles.amountSecondary}>{`username: ${contact.id}`}</Text>
      </View>
      <ScrollView style={styles.transactionsView}>
        <Text
          style={{ fontSize: 18, marginTop: 18, marginBottom: 12 }}
        >{`Transactions with ${contact.prettyName}`}</Text>
        {transactions.map((item, i) => (
          <TransactionItem navigation={navigation} tx={item} subtitle />
        ))}
      </ScrollView>
      <View style={{ paddingBottom: 18 }}>
        <LargeButton
          title={translate("MoveMoneyScreen.send")}
          icon={<IconTransaction isReceive={false} size={32} />}
          onPress={() => navigation.navigate("sendBitcoin", { username: contact.id })}
        />
      </View>
      <CloseCross color={palette.white} onPress={navigation.goBack} />
    </Screen>
  )
}
