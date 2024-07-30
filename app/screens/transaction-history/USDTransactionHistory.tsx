import * as React from "react"
import crashlytics from "@react-native-firebase/crashlytics"
import { ActivityIndicator, RefreshControl, SectionList, View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { BarIndicator } from "react-native-indicators"

// components
import { Screen } from "@app/components/screen"
import { TransactionItem } from "../../components/transaction-item"

// graphql
import { useTransactionListForDefaultAccountQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { groupTransactionsByDate } from "@app/graphql/transactions"

// utils
import { toastShow } from "../../utils/toast"
import { SectionTransactions } from "./index.types"

// store
import { usePersistentStateContext } from "@app/store/persistent-state"

export const USDTransactionHistory: React.FC = () => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { persistentState, updateState } = usePersistentStateContext()

  const [hasMore, setHasMore] = React.useState<boolean | undefined>()
  const [numOfTxs, setNumOfTxs] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)
  const [fetchingMore, setFetchingMore] = React.useState(false)
  const [transactions, setTransactions] = React.useState<SectionTransactions[]>(
    persistentState.usdTransactions || [],
  )

  const { data, error, fetchMore, refetch, loading } =
    useTransactionListForDefaultAccountQuery({
      skip: !useIsAuthed(),
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-and-network",
      variables: { first: 15 },
    })

  React.useEffect(() => {
    if (
      data?.me?.defaultAccount?.transactions?.edges &&
      data?.me?.defaultAccount?.transactions?.edges?.length > 0
    ) {
      const txs =
        data?.me?.defaultAccount?.transactions?.edges?.map((el) => el.node) ?? []

      const transactionSections = groupTransactionsByDate({
        txs: txs,
        common: LL.common,
      })

      setHasMore(data.me.defaultAccount.transactions.pageInfo.hasNextPage)
      setNumOfTxs(txs.length)
      setTransactions(transactionSections)
      updateState((state: any) => {
        if (state)
          return {
            ...state,
            usdTransactions: transactionSections,
          }
        return undefined
      })
    }
  }, [data?.me?.defaultAccount?.transactions?.edges])

  const onEndReached = async () => {
    if (!loading && !fetchingMore && hasMore) {
      setFetchingMore(true)
      const { data } = await fetchMore({
        variables: { first: numOfTxs + 15 },
      })
      const txs =
        data?.me?.defaultAccount?.transactions?.edges?.map((el) => el.node) ?? []
      const transactionSections = groupTransactionsByDate({
        txs: txs,
        common: LL.common,
      })

      setHasMore(data.me?.defaultAccount.transactions?.pageInfo.hasNextPage)
      setNumOfTxs(txs.length)
      setTransactions(transactionSections)
      setFetchingMore(false)
    }
  }

  const onRefresh = async () => {
    if (!loading && !refreshing) {
      setRefreshing(true)
      const { data } = await fetchMore({
        variables: { first: 15 },
      })
      const txs =
        data?.me?.defaultAccount?.transactions?.edges?.map((el) => el.node) ?? []
      const transactionSections = groupTransactionsByDate({
        txs: txs,
        common: LL.common,
      })

      setHasMore(data.me?.defaultAccount.transactions?.pageInfo.hasNextPage)
      setNumOfTxs(txs.length)
      setTransactions(transactionSections)
      setRefreshing(false)
    }
  }

  if (error) {
    if (error.message === "Network request failed") {
      toastShow({
        message: "Wallet is offline",
        currentTranslation: LL,
      })
    } else {
      toastShow({
        message: (translations) => translations.common.transactionsError(),
        currentTranslation: LL,
      })
    }
    console.error(error)
    crashlytics().recordError(error)
    return (
      <View style={styles.noTransactionView}>
        <Text style={styles.noTransactionText}>
          {LL.TransactionScreen.noTransaction()}
        </Text>
      </View>
    )
  } else if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size={"large"} />
      </View>
    )
  } else {
    return (
      <Screen>
        <SectionList
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index, section }) => (
            <TransactionItem
              tx={item}
              key={`txn-${item.id}`}
              subtitle
              isFirst={index === 0}
              isLast={index === section.data.length - 1}
            />
          )}
          initialNumToRender={20}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.noTransactionView}>
              <Text style={styles.noTransactionText}>
                {LL.TransactionScreen.noTransaction()}
              </Text>
            </View>
          }
          ListFooterComponent={() =>
            fetchingMore && (
              <BarIndicator
                color={colors.primary}
                count={5}
                size={20}
                style={{ marginVertical: 20 }}
              />
            )
          }
          sections={transactions}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      </Screen>
    )
  }
}

const useStyles = makeStyles(({ colors }) => ({
  loadingContainer: { justifyContent: "center", alignItems: "center", flex: 1 },
  noTransactionText: {
    fontSize: 24,
  },

  noTransactionView: {
    alignItems: "center",
    flex: 1,
    marginVertical: 48,
  },

  sectionHeaderContainer: {
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
  },

  sectionHeaderText: {
    color: colors.black,
    fontSize: 18,
  },
}))
