import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { useTransactionListForDefaultAccountQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { groupTransactionsByDate } from "@app/graphql/transactions"
import { useI18nContext } from "@app/i18n/i18n-react"
import crashlytics from "@react-native-firebase/crashlytics"
import { makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { ActivityIndicator, SectionList, Text, View } from "react-native"
import { TransactionItem } from "../../components/transaction-item"
import { toastShow } from "../../utils/toast"
// Breez SDK
import { listPaymentsBreezSDK } from "@app/utils/breez-sdk"
import { Payment } from "@breeztech/react-native-breez-sdk"
import { formatPaymentsBreezSDK } from "@app/hooks/useBreezPayments"
import { BreezTransactionItem } from "@app/components/transaction-item/breez-transaction-item"

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

export const TransactionHistoryScreen: React.FC = () => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const { LL } = useI18nContext()
  const { data, error, fetchMore, refetch, loading } =
    useTransactionListForDefaultAccountQuery({ skip: !useIsAuthed() })

  const transactions = data?.me?.defaultAccount?.transactions

  // Breez SDK transactions
  const [breezTransactions, setBreezTransactions] = React.useState<Payment[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [btcInDisplay, setBtcInDisplay] = React.useState(0)

  // React.useEffect(() => {
  //   fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setBtcInDisplay(data.bitcoin.usd)
  //     })
  //     .catch((error) => console.error("Error fetching BTC price:", error))
  // }, [])
  React.useEffect(() => {
    const listPaymentsBreez = async () => {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const payments = await listPaymentsBreezSDK()
      setBreezTransactions(payments)
    }
    listPaymentsBreez()
  }, [breezTransactions.length])

  const sections = React.useMemo(
    () =>
      groupTransactionsByDate({
        txs: transactions?.edges?.map((edge) => edge.node) ?? [],
        common: LL.common,
      }),
    [transactions, LL],
  )

  const breezSections = React.useMemo(() => {
    const formattedTxs = breezTransactions?.map((edge) =>
      formatPaymentsBreezSDK(edge.id, breezTransactions, btcInDisplay),
    )

    const validTxs = formattedTxs?.filter(Boolean) ?? []

    return groupTransactionsByDate({
      txs: validTxs,
      common: LL.common,
    })
  }, [breezTransactions, LL])

  if (error) {
    console.error(error)
    crashlytics().recordError(error)
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  }

  if (!transactions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size={"large"} />
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

  const combinedSections = [...sections, ...breezSections]

  return (
    <Screen>
      <SectionList
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index, section }) => {
          if (item.id.length > 24) {
            return (
              <BreezTransactionItem
                tx={item}
                key={`transaction-${item.id}`}
                subtitle
                isOnHomeScreen={true}
                isLast={index === section.data.length - 1}
              />
            )
            // eslint-disable-next-line no-else-return
          } else {
            return (
              <TransactionItem
                key={`txn-${item.id}`}
                isFirst={index === 0}
                isLast={index === section.data.length - 1}
                txid={item.id}
                subtitle
              />
            )
          }
        }}
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
        sections={combinedSections}
        keyExtractor={(item) => item.id}
        onEndReached={fetchNextTransactionsPage}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={loading}
      />
    </Screen>
  )
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
