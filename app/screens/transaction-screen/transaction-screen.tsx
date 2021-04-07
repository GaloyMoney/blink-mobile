import * as React from "react"
import { RefreshControl, SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar, WALLET } from "../../graphql/query"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import * as _ from "lodash"
import { useQuery, useReactiveVar } from "@apollo/client"
import { sameDay, sameMonth } from "../../utils/date"
import moment from "moment"

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
    justifyContent: "space-between",
    backgroundColor: palette.white
  },

  row: {
    flexDirection: 'row',
  },
})


const isToday = (tx) => {
  return sameDay(tx.date, new Date())
}

const isYesterday = (tx) => {
  return sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))
}

const isThisMonth = (tx) => {
  return sameMonth(tx.date, new Date())
}



export const TransactionHistoryScreenDataInjected = ({navigation, route}) => {
  const currency = "sat" // FIXME

  const { data } = useQuery(WALLET, { fetchPolicy: "cache-only" })

  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  let transactions = _.find(data.wallet, {id: "BTC"}).transactions.map(input => { return {
    date: moment.unix(input.created_at),
    ...input
  }})

  while (transactions.length) {
    // FIXME: optimization need. slow when there are a lot of txs.
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
    sections.push({ title: translate("PriceScreen.today"), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: translate("PriceScreen.yesterday"), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: translate("PriceScreen.thisMonth"), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: translate("PriceScreen.prevMonths"), data: before })
  }
  
  const prefCurrency = useReactiveVar(prefCurrencyVar)

  return <TransactionScreen 
    navigation={navigation} 
    currency={currency}
    // refreshing={loading}
    // error={error}
    prefCurrency={prefCurrency}
    nextPrefCurrency={nextPrefCurrency}
    // onRefresh={refreshQuery}
    sections={sections}
  />
}

export const TransactionScreen = 
  ({ refreshing, navigation, onRefresh, error, prefCurrency, nextPrefCurrency, sections }) =>
  <Screen style={styles.screen}>
    <SectionList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item, index, section }) => (
        <TransactionItem navigation={navigation} tx={item} />
      )}
      ListHeaderComponent={() => <>
        {error?.response?.errors?.map(({ message }) => 
          <Text style={{color: palette.red, alignSelf: "center", paddingBottom: 18}} selectable={true}>{message}</Text>
        )}
      </>}
      initialNumToRender={18}
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
