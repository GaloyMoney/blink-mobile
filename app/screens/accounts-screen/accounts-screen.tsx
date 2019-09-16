import * as React from "react"
import { observer, inject } from "mobx-react"
import { StyleSheet, TouchableHighlight, View } from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps, ScrollView, FlatList, withNavigation } from "react-navigation"
import { color } from "../../theme/color"
import Icon from 'react-native-vector-icons/Ionicons';
import currency from 'currency.js'
import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store"
import { AccountType } from "./AccountType"
import { CurrencyType } from "../../models/data-store/CurrencyType"

export interface AccountsScreenProps extends NavigationScreenProps<{}> {
  dataStore: DataStore
}

const accountBasic = {
  color: color.text,
  fontSize: 18,
  paddingHorizontal: 12
}

const styles = StyleSheet.create({
  accountView: {
      flexDirection: 'row',
      margin: 8,
      alignItems: 'center',

      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: color.line,
      padding: 16
  },

  accountAmount: {
    ...accountBasic
  },

  accountTypeStyle: {
    ...accountBasic,
    flex: 1
  },
})

const AccountItem = inject("dataStore")(observer((props) => {
  return (
      <TouchableHighlight 
          underlayColor="white"
          onPress={() => props.navigation.navigate('account_detail', {
            account: props.account,
          })}
          >
          <View style={styles.accountView} >
              <Icon name={props.icon} color={color.primary} size={28} />
              <Text style={styles.accountTypeStyle}>{props.account}</Text>
              <Text style={styles.accountAmount}>
                  {currency(props.dataStore.balances[props.account],
                      { formatWithSymbol: true } ).format()}
              </Text>
          </View>
      </TouchableHighlight>
)}))

const WithNavigationAccountItem = withNavigation(AccountItem)

@inject("dataStore")
@observer
export class AccountsScreen extends React.Component<AccountsScreenProps, {}> {
  menu: Array<Object> = [
    {key: "Checking", account: AccountType.Checking, icon: 'ios-cash'},
    {key: "Saving", account: AccountType.Saving, icon: 'ios-leaf'},
    {key: "Bitcoin", account: AccountType.Bitcoin, icon: 'logo-bitcoin'},
  ]

  render () {
    return (
      <Screen>
        <BalanceHeader amount={this.props.dataStore.total_balance} currency={CurrencyType.USD} />
        <ScrollView>
          <FlatList
            data={this.menu}
            renderItem={({ item }) => (
                <WithNavigationAccountItem {...item} />
        )} />
        </ScrollView>
      </Screen>
    )
  }
}


// AccountsScreen.navigationOptions = {
// title: 'Accounts',
// };