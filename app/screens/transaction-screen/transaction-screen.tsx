import { gql, useReactiveVar } from "@apollo/client"
import { useTransactionListForDefaultAccountQuery } from "@app/graphql/generated"
import { groupTransactionsByDate } from "@app/graphql/transactions"
import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
import { ActivityIndicator, SectionList, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { TransactionItem } from "../../components/transaction-item"
import { nextPrefCurrency, prefCurrencyVar } from "../../graphql/client-only-query"
import { palette } from "../../theme/palette"
import { toastShow } from "../../utils/toast"

const styles = EStyleSheet.create({
  icon: { color: palette.darkGrey, top: -4 },

  loadingContainer: { justifyContent: "center", alignItems: "center", flex: 1 },
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
    paddingHorizontal: "18rem",
    backgroundColor: palette.lighterGrey,
  },
  sectionHeaderContainer: {
    color: palette.darkGrey,
    backgroundColor: palette.lighterGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
  },

  sectionHeaderText: {
    color: palette.darkGrey,
    fontSize: 18,
  },
})

gql`
  query transactionListForDefaultAccount(
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      defaultAccount {
        id
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
`

export const TransactionHistoryScreenDataInjected: React.FC = () => {
  const { LL } = useI18nContext()
  const { data, error, fetchMore, refetch, loading } =
    useTransactionListForDefaultAccountQuery()
  const prefCurrency = useReactiveVar(prefCurrencyVar)

  const transactions = data?.me?.defaultAccount?.transactions

  const sections = React.useMemo(
    () =>
      groupTransactionsByDate({
        txs: transactions?.edges?.map((edge) => edge.node) ?? [],
        priceScreen: LL.PriceScreen,
      }),
    [transactions, LL],
  )

  if (error) {
    console.error(error)
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    // FIXME: we should have a proper component on error
    return (
      <View style={styles.loadingContainer}>
        <Text>{"Error"}</Text>
      </View>
    )
  }

  if (!transactions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.coolGrey} size={"large"} />
      </View>
    )
  }

  const fetchNextTransactionsPage = () => {
    const pageInfo = transactions?.pageInfo

    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      })
    }
  }

  return (
    <View style={styles.screen}>
      <SectionList
        showsVerticalScrollIndicator={false}
        style={styles.transactionGroup}
        renderItem={({ item, index, section }) => (
          <TransactionItem
            key={`txn-${item.id}`}
            isFirst={index === 0}
            isLast={index === section.data.length - 1}
            tx={item}
            subtitle
          />
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
              {LL.TransactionScreen.noTransaction()}
            </Text>
          </View>
        }
        sections={sections}
        keyExtractor={(item) => item.id}
        onEndReached={fetchNextTransactionsPage}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={loading}
      />
    </View>
  )
}
