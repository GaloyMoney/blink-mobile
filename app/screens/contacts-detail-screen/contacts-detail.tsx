import { observer } from "mobx-react"
import * as React from "react"
import { View } from "react-native"
import { Button, Input, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { ScrollView } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { translate } from "../../i18n"
import { StoreContext, useQuery } from "../../models"
import { palette } from "../../theme/palette"


const styles = EStyleSheet.create({
  amount: {
    fontSize: "40rem",
    color: palette.white,
  },

  amountSecondary: {
    fontSize: "16rem",
    color: palette.white,
  },

  amountView: {
    alignItems: "center",
    paddingTop: "48rem",
    paddingBottom: "24rem",
  },

  transactionsView: {
    marginHorizontal: "30rem",
    flex: 1,
  },

  buttonStyle: {
    backgroundColor: palette.orange,
    borderRadius: 32,
    width: "50%",
    marginVertical: 18,
  },
})

export const ContactsDetailScreen = observer(({route, navigation}) => {
  const store = React.useContext(StoreContext)
  const { contactId } = route.params

  const contact = store.contacts.get(contactId)
  const transactions = store.transactionsWith({username: contact.id})

  return <ContactsDetailScreenJSX navigation={navigation} contact={contact} transactions={transactions} />
})

export const ContactsDetailScreenJSX = observer(({ contact, navigation, transactions }) => {
  const store = React.useContext(StoreContext)

  const [contactName, setContactName] = React.useState(contact.prettyName)

  // const { store, error, loading, setQuery } = useQuery()


  const updateName = () => { 
    const query = `mutation setName($username: String, $name: String) {
      updateContact {
          setName(username: $username, name: $name)
      }
    }`

    store.mutate(
      query,
      {username: contact.id, name: contactName},
      () => {
        store.contacts.get(contact.id).updateName(contactName)
      }
    )
  }

  return (
    <Screen style={styles.screen} unsafe={true} >
      <View style={[styles.amountView, {backgroundColor: palette.green}]}>
        <Icon name={"ios-person-outline"} size={94} color={palette.white} style={{margin: 0}} />
        <View style={{flexDirection: "row"}}>
          <Input 
            style={styles.amount}
            inputStyle={{textAlign: "center", textDecorationLine: 'underline' }}
            inputContainerStyle={{borderColor: palette.green}}
            onChangeText={setContactName}
            onSubmitEditing={updateName}
            onBlur={updateName}
            returnKeyType={"done"}
          >
            {contact.prettyName}
          </Input>
        </View>
        <Text style={styles.amountSecondary}>{`username: ${contact.id}`}</Text>
      </View>
      <ScrollView style={styles.transactionsView}>
        <Text style={{fontSize: 18, marginTop: 18, marginBottom: 12}}>{`Transactions with ${contact.prettyName}`}</Text>
        {
          transactions.map((item, i) => <TransactionItem navigation={navigation} tx={item} subtitle={true} />)
        }
      </ScrollView>
      <View style={{paddingBottom: 18}}>
        <LargeButton
          title={translate(`MoveMoneyScreen.send`)}
          icon={<IconTransaction isReceive={false} size={32} />}
          onPress={() => navigation.navigate("sendBitcoin", {username: contact.id})}
        />
      </View>
      <CloseCross color={palette.white} onPress={navigation.goBack} />
  </Screen>
)})
