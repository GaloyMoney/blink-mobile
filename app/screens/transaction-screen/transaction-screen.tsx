import { useQuery, useReactiveVar } from "@apollo/client"
import * as _ from "lodash"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar, WALLET } from "../../graphql/query"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"

const styles = EStyleSheet.create({
  amount: {
    color: palette.white,
    fontSize: "32rem",
    fontWeight: "bold",
  },

  amountText: {
    color: palette.white,
    fontSize: "18rem",
    marginVertical: "6rem",
  },

  amountView: {
    alignItems: "center",
    backgroundColor: palette.orange,
    paddingVertical: "48rem",
  },

  description: {
    marginVertical: 12,
  },

  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: "12rem",
  },

  entry: {
    color: palette.midGrey,
    marginBottom: "6rem",
  },

  map: {
    height: 150,
    marginBottom: 12,
    marginLeft: "auto",
    marginRight: 30,
    width: 150,
  },

  noTransactionText: {
    fontSize: "24rem",
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: "48rem",
  },

  row: {
    flexDirection: "row",
  },

  screen: {
    backgroundColor: palette.white,
  },

  sectionHeaderContainer: {
    backgroundColor: palette.white,
    color: palette.darkGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 22,
  },

  sectionHeaderText: {
    color: palette.darkGrey,
    fontSize: 18,
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

  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
  },
})

const isToday = (tx) => sameDay(tx.date, new Date())

const isYesterday = (tx) => sameDay(tx.date, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx) => sameMonth(tx.date, new Date())

export const TransactionHistoryScreenDataInjected = ({ navigation, route }) => {
  const currency = "sat" // FIXME

  const { data } = useQuery(WALLET, { fetchPolicy: "cache-only" })

  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  // we need a shallow copy because the array given by useQuery is otherwise immutable
  const transactions = [..._.find(data.wallet, { id: "BTC" }).transactions]

  while (transactions?.length) {
    // FIXME: optimization need. slow when there are a lot of txs.
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

  return (
    <TransactionScreen
      navigation={navigation}
      currency={currency}
      // refreshing={loading}
      // error={error}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      // onRefresh={refreshQuery}
      sections={sections}
    />
  )
}

export const TransactionScreen = ({
  refreshing,
  navigation,
  onRefresh,
  error,
  prefCurrency,
  nextPrefCurrency,
  sections,
}) => (
  <Screen style={styles.screen}>
    <SectionList
      // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item, index, section }) => (
        <TransactionItem navigation={navigation} tx={item} />
      )}
      ListHeaderComponent={() => (
        <>
          {error?.graphQLErrors?.map(({ message }) => (
            <Text style={{ color: palette.red, alignSelf: "center", paddingBottom: 18 }} selectable>
              {message}
            </Text>
          ))}
        </>
      )}
      initialNumToRender={18}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <TouchableOpacity style={styles.row} onPress={nextPrefCurrency}>
            <Text style={styles.sectionHeaderText}>{prefCurrency} </Text>
            <Icon name="ios-swap-vertical" size={32} style={{ top: -4 }} />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.noTransactionView}>
          <Text style={styles.noTransactionText}>
            {translate("TransactionScreen.noTransaction")}
          </Text>
        </View>
      }
      sections={sections}
      keyExtractor={(item, index) => item + index}
    />
  </Screen>
)
