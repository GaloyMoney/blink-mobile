import { ApolloError, useQuery, useReactiveVar } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import { translate } from "../../i18n"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { sameDay, sameMonth } from "../../utils/date"
import { toastShow } from "../../utils/toast"
import { useTransactions } from "@app/hooks/use-transactions"

const styles = EStyleSheet.create({
  errorText: { alignSelf: "center", color: palette.red, paddingBottom: 18 },

  icon: { color: palette.darkGrey, top: -4 },

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
})

const isToday = (tx) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx) => sameMonth(tx.createdAt, new Date())

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
}

const TRANSACTIONS_PER_PAGE = 20

export const TransactionHistoryScreenDataInjected: ScreenType = ({
  navigation,
}: Props) => {
  const currency = "sat" // FIXME

  const { error, transactions, pageInfo, refetch, loading, fetchMore } = useTransactions()
  const prefCurrency = useReactiveVar(prefCurrencyVar)

  if (error) {
    console.error(error)
    toastShow(translate("common.transactionsError"))
    return null
  }

  const sections = []
  const today = []
  const yesterday = []
  const thisMonth = []
  const before = []

  transactions.forEach((tx) => {
    if (isToday(tx)) {
      today.push(tx)
    } else if (isYesterday(tx)) {
      yesterday.push(tx)
    } else if (isThisMonth(tx)) {
      thisMonth.push(tx)
    } else {
      before.push(tx)
    }
  })

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

  return (
    <TransactionScreen
      navigation={navigation}
      currency={currency}
      prefCurrency={prefCurrency}
      nextPrefCurrency={nextPrefCurrency}
      sections={sections}
      fetchMore={fetchMore}
      loading={loading}
      refetch={refetch}
      pageInfo={pageInfo}
      transactions={transactions}
    />
  )
}

type TransactionScreenProps = {
  refreshing: boolean
  navigation: StackNavigationProp<RootStackParamList, "transactionHistory">
  onRefresh: () => void
  error: ApolloError
  prefCurrency: string
  nextPrefCurrency: () => void
  sections: []
  fetchNextTransactionsPage: () => void
  loading: boolean
  refetch: () => void
  fetchMore: (arg0: object) => void
  pageInfo: { hasNextPage: boolean }
  transactions: [WalletTransaction | null]
}

export const TransactionScreen: ScreenType = ({
  navigation,
  error,
  prefCurrency,
  nextPrefCurrency,
  sections,
  fetchMore,
  loading,
  refetch,
  pageInfo,
  transactions,
}: TransactionScreenProps) => (
  <Screen style={styles.screen}>
    <SectionList
      renderItem={({ item }) => (
        <TransactionItem key={`txn-${item.id}`} navigation={navigation} tx={item} />
      )}
      ListHeaderComponent={() => (
        <>
          {error?.graphQLErrors?.map(({ message }, item) => (
            <Text key={`error-${item}`} style={styles.errorText} selectable>
              {message}
            </Text>
          ))}
        </>
      )}
      initialNumToRender={20}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <TouchableOpacity style={styles.row} onPress={nextPrefCurrency}>
            <Text style={styles.sectionHeaderText}>
              {prefCurrency === "BTC" ? "sats" : prefCurrency}{" "}
            </Text>
            <Icon name="ios-swap-vertical" size={32} style={styles.icon} />
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
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        console.log(pageInfo.hasNextPage)
        console.log(transactions[transactions.length - 1].cursor)
        if (pageInfo.hasNextPage) {
          fetchMore({
            variables: {
              first: TRANSACTIONS_PER_PAGE,
              after: transactions[transactions.length - 1].cursor,
            },
          })
        }
      }}
      onEndReachedThreshold={0.5}
      onRefresh={() => refetch()}
      refreshing={loading}
    />
  </Screen>
)
