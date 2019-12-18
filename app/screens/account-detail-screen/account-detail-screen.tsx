import * as React from "react"
import { observer, inject } from "mobx-react"

import { View, SectionList, StyleSheet } from "react-native";

import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { NavigationScreenProps } from "react-navigation"
import Icon from 'react-native-vector-icons/Ionicons';

import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store";
import { sameDay, sameMonth } from "../../utils/date";
import { AccountType } from "../accounts-screen/AccountType";
import { CurrencyText } from "../../components/currency-text";
import { TouchableHighlight } from "react-native-gesture-handler";
import { withNavigation } from "react-navigation";

export interface AccountDetailScreenProps extends NavigationScreenProps<{}> {
  account: AccountType,
  dataStore: DataStore,
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    marginVertical: 12,
    marginHorizontal: 24,
    alignItems: "center"
  },

  itemText: {
    color: color.text,
    fontSize: 18
  },

  headerSection: {
    color: color.text,
    margin: 22
  },

  icon: {
    width: 32,
    textAlign: "center",
    marginRight: 24
  },

  vertical: {
    flexDirection: "column"
  },

  flex: {
    flex: 1
  },

  cashback: {
    fontSize: 12,
  } 
});

function AccountDetailItem(props) {
  return (
    <TouchableHighlight 
    underlayColor="white"
    onPress={() => props.navigation.navigate('transactionDetail', {
      name: props.name,
      amount: props.amount,
      cashback: props.cashback,
      currency: props.currency,
      date: props.date,
    })} >
      <View key={props.index} style={styles.itemContainer}>
        <Icon
          name={props.icon}
          style={styles.icon}
          color={color.primary}
          size={28}
        />
        <View style={styles.flex}>
          <Text style={styles.itemText}>{props.name}</Text>
          {props.cashback != null &&
            <Text style={styles.cashback}>{props.cashback} sats</Text> 
          || props.addr != null &&
            <Text style={styles.cashback}>{props.addr}</Text> 
          }
        </View>
        <CurrencyText amount={props.amount} currency={props.currency} />
      </View>
    </TouchableHighlight>
  );
}

const WithNavigationAccountDetailItem = withNavigation(AccountDetailItem)


@inject("dataStore")
@observer
export class AccountDetailScreen extends React.Component<AccountDetailScreenProps, {}> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("account")
    };
  };

  componentDidMount() {
      // FIXME: duplicates with render()

      const dataStore = this.props.dataStore;
      let accountType = this.props.navigation.getParam("account"); // FIXME how to pass this properly?
      let accountStore = accountType == AccountType.Checking ? this.props.dataStore.fiat : this.props.dataStore.lnd

      accountStore.update_transactions()
  }

  render() {
    const dataStore = this.props.dataStore;
    let accountType = this.props.navigation.getParam("account"); // FIXME how to pass this properly?
    let accountStore = accountType == AccountType.Checking ? this.props.dataStore.fiat : this.props.dataStore.lnd

    let transactions = accountStore.transactions;

    if (transactions.length === 0) {
      return <Text>It's empty in here</Text>
    }

    var currency = accountStore.currency

    transactions.slice().sort((a, b) => (a.date < b.date ? -1 : 1)); // warning without slice?

    let transactions_set = new Set(transactions);

    let today = transactions.filter(tx => sameDay(tx.date, new Date()));

    let yesterday = transactions.filter(tx =>
      sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))
    );
    
    let transactions_included = new Set([...today, ...yesterday])
    let not_yet_included_set = new Set(
      [...transactions_set].filter(x => !transactions_included.has(x))
    );

    let this_month = Array.from(not_yet_included_set).filter(
      tx => sameMonth(tx.date, new Date())); // FIXME wrong if first day of the month

    transactions_included = new Set([...today, ...yesterday, ...this_month]); //FIXME DRY
    not_yet_included_set = new Set(
      [...transactions_set].filter(x => !transactions_included.has(x))
    );

    let before = Array.from(not_yet_included_set);

    let sections = [];
    if (today.length > 0) {
      sections.push({ title: "Today", data: today });
    }

    if (yesterday.length > 0) {
      sections.push({ title: "Yesterday", data: yesterday });
    }

    if (this_month.length > 0) {
      sections.push({ title: "This month", data: this_month });
    }

    if (before.length > 0) {
      sections.push({ title: "Previous months", data: before });
    }

    return (
      <Screen>
        <BalanceHeader
          amount={accountStore.balance}
          eq_dollar={dataStore.usd_balances[accountType]}
          currency={currency}
        />
        <SectionList
          renderItem={({ item, index, section }) => (
            <WithNavigationAccountDetailItem 
            account={accountType} currency={currency} {...item} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.headerSection}>{title}</Text>
          )}
          sections={sections}
          keyExtractor={(item, index) => item + index}
        />
      </Screen>
    );
  }
}
