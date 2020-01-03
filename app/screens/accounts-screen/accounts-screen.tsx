import * as React from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, TouchableHighlight, View, Alert, Button } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProp, FlatList, withNavigation } from "react-navigation"
import { color } from "../../theme/color"
import Icon from 'react-native-vector-icons/Ionicons'
import currency from 'currency.js'
import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store"
import { AccountType } from "./AccountType"
import { CurrencyType } from "../../models/data-store/CurrencyType"
import auth from "@react-native-firebase/auth"

export interface AccountsScreenProps extends NavigationScreenProp<{}> {
  dataStore: DataStore
}

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

const AccountItem = inject("dataStore")(observer((props) => {
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
}))

const WithNavigationAccountItem = withNavigation(AccountItem)

@inject("dataStore")
@observer
export class AccountsScreen extends React.Component<AccountsScreenProps, {}> {
  menu: Array<Record<string, any>> = [
    { key: "Checking", account: AccountType.Checking, icon: 'ios-cash' },
    { key: "Bitcoin", account: AccountType.Bitcoin, icon: 'logo-bitcoin' },
  ]

  componentDidMount() {
    this.props.dataStore.update_balance() // TODO should be fetch also at regular interval and if user refresh it intentionnaly
  }

  signOut() {
    auth().signOut()
      .then(() => {
        this.props.navigation.navigate('loginStack')
      })
      .catch(err => {
        console.tron.log(err)
        Alert.alert(err.code)
      })
  }

  render () {
    return (
      <Screen>
        <BalanceHeader amount={this.props.dataStore.total_usd_balance} currency={CurrencyType.USD} />
        <FlatList
          data={this.menu}
          renderItem={({ item }) => (
            <WithNavigationAccountItem {...item} />
          )} />
        <Button title="debugScreen" onPress={() => this.props.navigation.navigate('demo')}></Button>
        <Button title="Log out" onPress={() => this.signOut()}></Button>
      </Screen>
    )
  }
}

// AccountsScreen.navigationOptions = {
// title: 'Accounts',
// };
