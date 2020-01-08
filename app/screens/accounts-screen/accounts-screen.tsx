import * as React from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, TouchableHighlight, View, Alert, Button } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { FlatList, withNavigation } from "react-navigation"
import { color } from "../../theme/color"
import Icon from 'react-native-vector-icons/Ionicons'
import currency from 'currency.js'
import { BalanceHeader } from "../../components/balance-header"
import { AccountType } from "./AccountType"
import { CurrencyType } from "../../models/data-store/CurrencyType"
import auth from "@react-native-firebase/auth"

const accountBasic = {
  color: color.text,
  fontSize: 18,
  paddingHorizontal: 12
}

const styles = StyleSheet.create({
  accountAmount: {
    ...accountBasic
  },

  accountTypeStyle: {
    ...accountBasic,
    flex: 1
  },

  accountView: {
    alignItems: 'center',
    borderColor: color.line,
    borderRadius: 4,

    borderWidth: 0.5,
    flexDirection: 'row',
    margin: 8,
    padding: 16
  },
})

const AccountItem = withNavigation(inject("dataStore")(observer((props) => {
  return (
    <TouchableHighlight
      underlayColor="white"
      onPress={() => props.navigation.navigate('accountDetail', {
        account: props.account,
      })}
    >
      <View style={styles.accountView} >
        <Icon name={props.icon} color={color.primary} size={28} />
        <Text style={styles.accountTypeStyle}>{props.account}</Text>
        <Text style={styles.accountAmount}>
          {currency(props.dataStore.usd_balances[props.account],
            { formatWithSymbol: true }).format()}
        </Text>
      </View>
    </TouchableHighlight>
  )
})))

export const AccountsScreen = withNavigation(inject("dataStore")(observer(
  ({dataStore, navigation}) => {

  const accountTypes: Array<Record<string, any>> = [ //FIXME type any
    { key: "Checking", account: AccountType.Checking, icon: 'ios-cash' },
    { key: "Bitcoin", account: AccountType.Bitcoin, icon: 'logo-bitcoin' },
  ]

  dataStore.updateBalance() // TODO should be fetch also at regular interval and if user refresh it intentionnaly

  const signOut = () => {
    auth().signOut()
      .then(() => {
        navigation.navigate('authStack')
      })
      .catch(err => {
        console.tron.log(err)
        Alert.alert(err.code)
      })
  }

  return (
    <Screen>
      <BalanceHeader amount={dataStore.total_usd_balance} currency={CurrencyType.USD} />
      <FlatList
        data={accountTypes}
        renderItem={({ item }) => (
          <AccountItem {...item} />
        )} />
      <Button title="debugScreen" onPress={() => navigation.navigate('demo')}></Button>
      <Button title="Log out" onPress={() => signOut()}></Button>
    </Screen>
  )
})))

AccountsScreen.navigationOptions = {
  title: 'Accounts'
}
