import { StackNavigationProp } from "@react-navigation/stack"
import * as currency_fmt from "currency.js"
import { observer } from "mobx-react"
import moment from "moment"
import * as React from "react"
import { RefreshControl, SectionList, Text, View } from "react-native"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import { IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { StoreContext, useQuery } from "../../models"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { AccountType, CurrencyType } from "../../utils/enum"
import { getMainQuery } from "../../utils/mainQuery"
import Icon from "react-native-vector-icons/Ionicons"


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

  sectionHeaderText: {
    color: palette.darkGrey,
    fontSize: 18,
  },

  sectionHeaderContainer: {
    color: palette.darkGrey,
    padding: 22,
    flexDirection: 'row',
    justifyContent: "space-between"
  },

  row: {
    flexDirection: 'row',
  },
})

const formatTransactions = (transactions) => {
  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  transactions = transactions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)) // warning without slice?
  transactions.forEach(tx => tx.date = moment.unix(tx.created_at))
  transactions.forEach(tx => tx.sendOrReceive = iconTypeFromAmount(tx.amount))

  const isToday = (tx) => {
    return sameDay(tx.date, new Date())
  }

  const isYesterday = (tx) => {
    return sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))
  }

  const isThisMonth = (tx) => {
    return sameMonth(tx.date, new Date())
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


export const TransactionScreenDataInjected = observer(({navigation, route}) => {

  const store = React.useContext(StoreContext)
  const { query, error, loading, setQuery } = useQuery()

  const refreshQuery = async () => {
    console.tron.log("refresh query")
    setQuery(getMainQuery())
    await query.refetch()
  }

  const currency = "sat" // FIXME

  return <TransactionScreen 
    navigation={navigation} 
    currency={currency}
    refreshing={loading}
    error={error}
    prefCurrency={store.prefCurrency}
    nextPrefCurrency={store.nextPrefCurrency}
    onRefresh={refreshQuery}
    transactions={store.wallets.get("BTC").transactions}
  />
})

export interface AccountDetailItemProps {
  account: AccountType,
  currency: CurrencyType,
  navigation: StackNavigationProp<any,any>,
}

export const iconTypeFromAmount = (amount) => amount > 0 ? "receive" : "send"
const colorForText = type => type === "send" ? palette.darkGrey : palette.green 

export const TransactionScreen = ({ transactions, refreshing, navigation, currency, onRefresh, error, prefCurrency, nextPrefCurrency }) => {

  const sections = formatTransactions(transactions)

  const AccountDetailItem: React.FC<AccountDetailItemProps> = (props) => {
    const amount = prefCurrency === "sats" ? props.amount : props.usd
    const symbol = prefCurrency === "sats" ? '' : "$"
    const precision = prefCurrency === "sats" ? 0 : amount < 0.01 ? 4 : 2

    return (<ListItem
      // key={props.hash}
      title={props.description}
      leftIcon={<IconTransaction
        type={props.sendOrReceive}
        size={24}
      />}
      rightTitle={<Text style={{color: colorForText(props.sendOrReceive)}}>
        {currency_fmt.default(amount, { separator: ",", symbol, precision }).format()}  
      </Text>}
      onPress={() => props.navigation.navigate("transactionDetail", props)}
      />
    )}

  return (
    <Screen style={styles.screen}>
      <SectionList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index, section }) => (
          <AccountDetailItem currency={currency} navigation={navigation} {...item} />
        )}
        ListHeaderComponent={error && 
          <Text style={{color: palette.red, alignSelf: "center", paddingBottom: 18}} selectable={true}>{error.message}</Text>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
            <TouchableOpacity style={styles.row} onPress={nextPrefCurrency}>
              <Text style={styles.sectionHeaderText}>{prefCurrency} </Text>
              <Icon name={"ios-swap-vertical"} size={32} style={{top: -4}} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View style={styles.noTransactionView}>
          <Text style={styles.noTransactionText}>{translate("TransactionScreen.noTransaction")}</Text>
        </View>}
        sections={sections}
        keyExtractor={(item, index) => item + index}
      />
    </Screen>
)}
