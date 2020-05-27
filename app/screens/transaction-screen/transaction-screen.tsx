import { StackNavigationProp } from "@react-navigation/stack"
import { observer } from "mobx-react"
import * as React from "react"
import { RefreshControl, SectionList, Text, View } from "react-native"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { ILightningTransaction } from "../../../../common/types"
import { CurrencyText } from "../../components/currency-text"
import { IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { useQuery } from "../../models"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { AccountType, CurrencyType } from "../../utils/enum"



const styles = EStyleSheet.create({
  screen: {
    backgroundColor: palette.white
  },

  amountText: {
    fontSize: "18rem",
    marginVertical: "6rem",
    color: palette.white,
  },

  amount: {
    fontSize: "32rem",
    color: palette.white,
    fontWeight: "bold",
  },

  amountView: {
    alignItems: "center",
    paddingVertical: "48rem",
    backgroundColor: palette.orange,
  },

  description: {
    marginVertical: 12,
  },

  map: {
    height: 150,
    marginBottom: 12,
    marginLeft: "auto",
    marginRight: 30,
    width: 150,
  },

  entry: {
    color: palette.midGrey,
    marginBottom: "6rem",
  },

  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
  },

  transactionDetailText: {
    color: palette.darkGrey,
    fontSize: "18rem",
    fontWeight: "bold",
  },

  transactionDetailView: {
    marginHorizontal: "24rem",
    marginVertical: "24rem",
  },

  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: "12rem",
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: "48rem"
  },
  
  noTransactionText: {
    fontSize: "24rem"
  },

  headerSection: {
    backgroundColor: palette.white,
    color: palette.darkGrey,
    fontSize: 18,
    padding: 22,
  },
})

const formatTransactions = (transactions) => {
  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  transactions = transactions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)) // warning without slice?

  const isToday = (tx) => {
    return sameDay(tx.created_at, new Date())
  }

  const isYesterday = (tx) => {
    return sameDay(tx.created_at, new Date().setDate(new Date().getDate() - 1))
  }

  const isThisMonth = (tx) => {
    return sameMonth(tx.created_at, new Date())
  }

  if (transactions.length === 0) {
    sections.push({ title: "", data: [{}] })
  }

  while (transactions.length) {
    // this could be optimized
    const tx = transactions.shift()
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
    sections.push({ title: translate("AccountDetailScreen.today"), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.yesterday"), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.thisMonth"), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: translate("AccountDetailScreen.prevMonths"), data: before })
  }

  return sections
}


export const AccountToWallet = ({account, store}) => {
  // FIXME should have a generic mapping here, could use mst for it?
  switch (account) {
    case AccountType.Bank:
      return store.wallet("USD")
    case AccountType.Bitcoin:
      return store.wallet("BTC")
  }
}


export const TransactionScreenDataInjected = observer(({navigation, route}) => {
  const { store, error, loading, data } = useQuery(store => store.queryWallet({uid: "1234"})) // FIXME

  const account = route.params.account
  let wallet = AccountToWallet({account, store}) 
  
  // FIXME useCallBack??
  // const onRefresh = React.useCallback(async () => {
  //   setRefreshing(true)
  //   await wallet.update()
  //   setRefreshing(false)
  // }, [refreshing])

  // React.useEffect(() => {
  //   onRefresh()
  // }, [])

  return <TransactionScreen 
    navigation={navigation} 
    currency={wallet.currency}
    refreshing={loading}
    onRefresh={() => {}}
    // onRefresh={onRefresh} FIXME
    transactions={wallet.transactions ?? []} // FIXME
  />
})

export interface AccountDetailItemProps extends ILightningTransaction {
  account: AccountType,
  currency: CurrencyType,
  navigation: StackNavigationProp<any,any>,
}

const AccountDetailItem: React.FC<AccountDetailItemProps> = (props) => {
  if (props.description) {
    return (<ListItem
    // key={props.hash}
    title={props.description}
    leftIcon={<IconTransaction 
      type={props.type.includes("invoice") || props.type.includes("earn") ? "receive" : "send"}
      size={24} 
      color={palette.orange} />}
    rightTitle={<CurrencyText amount={props.amount} currency={props.currency} textColor={palette.darkGrey} />}
    onPress={() => props.navigation.navigate("transactionDetail", props)}
    />)
  } else { 
    // no transaction
    return (
    <View style={styles.noTransactionView}>
      <Text style={styles.noTransactionText}>No transaction to show :(</Text>
    </View>)
  }
}

export const TransactionScreen = ({ transactions, refreshing, navigation, currency, onRefresh }) => {

  const sections = formatTransactions(transactions)
  
  return (
    <Screen style={styles.screen}>
      <SectionList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index, section }) => (
          <AccountDetailItem currency={currency} navigation={navigation} {...item} 
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.headerSection}>{title}</Text>
        )}
        sections={sections}
        keyExtractor={(item, index) => item + index}
      />
    </Screen>
  )
}
