import * as React from "react"
import { observer, inject } from "mobx-react"

import { View, SectionList, StyleSheet } from "react-native"

import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"

import { BalanceHeader } from "../../components/balance-header"
import { DataStore } from "../../models/data-store"
import { sameDay, sameMonth } from "../../utils/date"
import { CurrencyText } from "../../components/currency-text"
import { TouchableHighlight } from "react-native-gesture-handler"
import { AccountType } from "../../utils/enum"
import { useNavigation, useNavigationParam } from "react-navigation-hooks"

export interface AccountDetailScreenProps {
  account: AccountType
  dataStore: DataStore
}

export interface AccountDetailItemProps {
  // TODO check validity of this interface
  name: string,
  amount: number,
  cashback?: number,
  currency: CurrencyType,
  date: Date,
  addr?: string,
  index: number,
  icon: string
}

const styles = StyleSheet.create({
  cashback: {
    fontSize: 12,
  },

  flex: {
    flex: 1,
  },

  headerSection: {
    color: color.text,
    margin: 22,
  },

  icon: {
    marginRight: 24,
    textAlign: "center",
    width: 32,
  },

  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 24,
    marginVertical: 12,
  },

  itemText: {
    color: color.text,
    fontSize: 18,
  },

  vertical: {
    flexDirection: "column",
  },
})

const AccountDetailItem: React.FC<AccountDetailItemProps> = (props) => {
  const { navigate } = useNavigation()

  return (
    <TouchableHighlight
      underlayColor="white"
      onPress={() =>
        navigate("transactionDetail", {
          name: props.name,
          amount: props.amount,
          cashback: props.cashback,
          currency: props.currency,
          date: props.date,
        })
      }
    >
      <View key={props.index} style={styles.itemContainer}>
        <Icon name={props.icon} style={styles.icon} color={color.primary} size={28} />
        <View style={styles.flex}>
          <Text style={styles.itemText}>{props.name}</Text>
          {(props.cashback != null && <Text style={styles.cashback}>{props.cashback} sats</Text>) ||
            (props.addr != null && <Text style={styles.cashback}>{props.addr}</Text>)}
        </View>
        <CurrencyText amount={props.amount} currency={props.currency} />
      </View>
    </TouchableHighlight>
  )
}

export const AccountDetailScreen: React.FC<AccountDetailScreenProps>
  = inject("dataStore")(
    observer(({ dataStore }) => {

    const account = useNavigationParam("account")

    const accountStore = account === AccountType.Checking ?
        dataStore.fiat
      : dataStore.lnd

    let transactions = accountStore.transactions

    if (transactions.length === 0) {
      return <Text>No transaction to show</Text>
    }

    const currency = accountStore.currency

    transactions = transactions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)) // warning without slice?

    const transactions_set = new Set(transactions)

    // XXX FIXME TODO: clean up logic. 
    // transactions were not ordered before.
    // no need to use Set.
    const today = transactions.filter(tx => sameDay(tx.date, new Date()))

    const yesterday = transactions.filter(tx =>
      sameDay(tx.date, new Date().setDate(new Date().getDate() - 1)),
    )

    let transactions_included = new Set([...today, ...yesterday])
    let not_yet_included_set = new Set(
      [...transactions_set].filter(x => !transactions_included.has(x)),
    )

    const this_month = Array.from(not_yet_included_set).filter(tx => sameMonth(tx.date, new Date())) // FIXME wrong if first day of the month

    transactions_included = new Set([...today, ...yesterday, ...this_month]) // FIXME DRY
    not_yet_included_set = new Set([...transactions_set].filter(x => !transactions_included.has(x)))

    const before = Array.from(not_yet_included_set)

    const sections = []
    if (today.length > 0) {
      sections.push({ title: "Today", data: today })
    }

    if (yesterday.length > 0) {
      sections.push({ title: "Yesterday", data: yesterday })
    }

    if (this_month.length > 0) {
      sections.push({ title: "This month", data: this_month })
    }

    if (before.length > 0) {
      sections.push({ title: "Previous months", data: before })
    }

    return (
      <Screen>
        <BalanceHeader headingCurrency={currency} accountsToAdd={account} />
        <SectionList
          renderItem={({ item, index, section }) => (
            <AccountDetailItem account={account} currency={currency} {...item} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.headerSection}>{title}</Text>
          )}
          sections={sections}
          keyExtractor={(item, index) => item + index}
        />
      </Screen>
    )
}))

AccountDetailScreen.navigationOptions = screenProps => ({
  title: screenProps.navigation.getParam("account")
})
