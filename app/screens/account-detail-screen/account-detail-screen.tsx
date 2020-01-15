import * as React from "react"
import { useState, useEffect } from "react"
import { observer, inject } from "mobx-react"

import { View, SectionList, StyleSheet, RefreshControl } from "react-native"

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

    const [refreshing, setRefreshing] = useState(false);
    const [sections, setSections] = useState([]);

    const account = useNavigationParam("account")

    const accountStore = account === AccountType.Checking ?
        dataStore.fiat
      : dataStore.lnd

    const currency = accountStore.currency

    const onRefresh = React.useCallback(async () => {
      setRefreshing(true);
      await updateTransactions()
      setRefreshing(false);
    }, [refreshing]);

    const updateTransactions = async () => {
      await accountStore.update()

      let transactions = accountStore.transactions
      
      const _sections = []
      const today = []
      const yesterday = []
      const thisMonth = []
      const before = []

      if (transactions.length === 0) {
        return <Text>No transaction to show</Text>
      }
    
      transactions = transactions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)) // warning without slice?
  
      const isToday = (tx) => {
        return sameDay(tx.date, new Date())
      }

      const isYesterday = (tx) => {
        return sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))
      }

      const isThisMonth = (tx) => {
        return sameMonth(tx.date, new Date())
      }

      while(transactions.length) { // this could be optimized
        let tx = transactions.shift()
        if (isToday(tx)) {
          today.push(tx)
        } else if (isYesterday(tx)) {
          yesterday.push(tx)
        } else if (isThisMonth(tx)) {
          thisMonth.push(tx)
        } else {
          before.push(tx)
        }
      }
      
      if (today.length > 0) {
        _sections.push({ title: "Today", data: today })
      }
  
      if (yesterday.length > 0) {
        _sections.push({ title: "Yesterday", data: yesterday })
      }
  
      if (thisMonth.length > 0) {
        _sections.push({ title: "This month", data: thisMonth })
      }
  
      if (before.length > 0) {
        _sections.push({ title: "Previous months", data: before })
      }

      setSections(_sections)
    }

    useEffect(() => {
      updateTransactions()
    }, [])

    return (
      <Screen>
        <BalanceHeader headingCurrency={currency} accountsToAdd={account} />
        <SectionList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
