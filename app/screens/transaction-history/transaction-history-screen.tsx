import * as React from "react"
import crashlytics from "@react-native-firebase/crashlytics"
import { ActivityIndicator, SectionList, Text, View } from "react-native"
import { usePriceConversion } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme } from "@rneui/themed"

// components
import { Screen } from "@app/components/screen"
import { TransactionItem } from "../../components/transaction-item"

// graphql
import {
  WalletCurrency,
  useTransactionListForDefaultAccountQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { groupTransactionsByDate } from "@app/graphql/transactions"

// Breez SDK
import { listPaymentsBreezSDK } from "@app/utils/breez-sdk"
import { Payment } from "@breeztech/react-native-breez-sdk"
import { formatPaymentsBreezSDK } from "@app/hooks/useBreezPayments"
import { BreezTransactionItem } from "@app/components/transaction-item/breez-transaction-item"

// utils
import { toBtcMoneyAmount } from "@app/types/amounts"
import { toastShow } from "../../utils/toast"

// types
import { SectionTransactions } from "./index.types"

export const TransactionHistoryScreen: React.FC = () => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { convertMoneyAmount } = usePriceConversion()
  const { data, error, fetchMore, refetch, loading } =
    useTransactionListForDefaultAccountQuery({ skip: !useIsAuthed() })
  const [breezLoading, setBreezLoading] = React.useState(false)
  const [mergedSectionData, setMergedSectionData] = React.useState<SectionTransactions[]>(
    [],
  )

  React.useEffect(() => {
    fetchPaymentsBreez()
  }, [])

  const fetchPaymentsBreez = async () => {
    setBreezLoading(true)
    const payments = await listPaymentsBreezSDK()
    mergeTransactions(payments)
  }

  const mergeTransactions = async (breezTxs: Payment[]) => {
    const mergedTransactions = []
    const transactions = data?.me?.defaultAccount?.transactions?.edges || []
    const formattedBreezTxs = await formatBreezTransactions(breezTxs)

    let i = 0
    let j = 0
    while (transactions.length != i && formattedBreezTxs.length != j) {
      if (transactions[i].node?.createdAt > formattedBreezTxs[j]?.createdAt) {
        mergedTransactions.push(transactions[i].node)
        i++
      } else {
        mergedTransactions.push(formattedBreezTxs[j])
        j++
      }
    }

    while (transactions.length !== i) {
      mergedTransactions.push(transactions[i].node)
      i++
    }

    while (formattedBreezTxs.length !== j) {
      mergedTransactions.push(formattedBreezTxs[j])
      j++
    }

    const transactionSections = groupTransactionsByDate({
      txs: mergedTransactions ?? [],
      common: LL.common,
    })

    setMergedSectionData(transactionSections)
    setBreezLoading(false)
  }

  const formatBreezTransactions = async (txs: Payment[]) => {
    if (!convertMoneyAmount || !txs) {
      return []
    }
    const formattedTxs = txs?.map((edge) =>
      formatPaymentsBreezSDK(
        edge.id,
        txs,
        convertMoneyAmount(toBtcMoneyAmount(edge.amountMsat / 1000), WalletCurrency.Usd)
          .amount,
      ),
    )

    return formattedTxs?.filter(Boolean) ?? []
  }

  const fetchNextTransactionsPage = () => {
    const pageInfo = data?.me?.defaultAccount?.transactions?.pageInfo
    if (pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      })
    }
  }

  if (error) {
    console.error(error)
    crashlytics().recordError(error)
    toastShow({
      message: (translations) => translations.common.transactionsError(),
      currentTranslation: LL,
    })
    return <></>
  } else if (breezLoading) {
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
          renderItem={({ item, index, section }) => {
            if (item.settlementCurrency === "BTC") {
              return (
                <BreezTransactionItem
                  tx={item}
                  key={`transaction-${item.id}`}
                  subtitle
                  isFirst={index === 0}
                  isLast={index === section.data.length - 1}
                />
              )
              // eslint-disable-next-line no-else-return
            } else {
              return (
                <TransactionItem
                  tx={item}
                  key={`txn-${item.id}`}
                  subtitle
                  isFirst={index === 0}
                  isLast={index === section.data.length - 1}
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
          sections={mergedSectionData}
          keyExtractor={(item) => item.id}
          onEndReached={fetchNextTransactionsPage}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={loading}
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
