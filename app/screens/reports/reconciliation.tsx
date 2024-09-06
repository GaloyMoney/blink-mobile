import React, { useEffect, useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Button, makeStyles } from "@rneui/themed"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// components
import { Screen } from "../../components/screen"
import { DateRangeDisplay } from "../../components/date-range-display"

// hooks
import { usePriceConversion } from "@app/hooks"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

// gql
import {
  useTransactionListForDefaultAccountQuery,
  TxDirection,
} from "@app/graphql/generated"

// types
import { toUsdMoneyAmount } from "@app/types/amounts"

// utils
import {
  filterTransactionsByDate,
  filterTransactionsByDirection,
  calculateTotalAmount,
  convertToDisplayCurrency,
  orderAndConvertTransactionsByDate,
} from "@app/utils/transaction-filters"
import { exportTransactionsToHTML, exportTransactionsToPDF } from "../../utils/pdfExport"

type Props = StackScreenProps<RootStackParamList, "Reconciliation">

export const ReconciliationReport: React.FC<Props> = ({ route }) => {
  const { from, to } = route.params
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const styles = useStyles()

  const [balance, setBalance] = useState("$0.00")
  const [balanceInDisplayCurrency, setBalanceInDisplayCurrency] = useState("$0.00")
  const [selectedDirection, setSelectedDirection] = useState<TxDirection>()

  const { formatMoneyAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()

  const { data, error, loading } = useTransactionListForDefaultAccountQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network",
    variables: { first: 100 },
  })

  useEffect(() => {
    if (data) {
      const transactions =
        data.me?.defaultAccount?.transactions?.edges?.map((edge) => edge.node) || []

      const filteredTransactions = filterTransactionsByDirection(
        filterTransactionsByDate(transactions, from, to),
        selectedDirection,
      )

      const totalAmount = calculateTotalAmount(filteredTransactions)
      setBalance(
        formatMoneyAmount({
          moneyAmount: toUsdMoneyAmount(totalAmount * 100),
          noSymbol: false,
        }),
      )

      const convertedBalance = convertToDisplayCurrency(totalAmount, convertMoneyAmount)
      if (convertedBalance) {
        setBalanceInDisplayCurrency(
          formatMoneyAmount({
            moneyAmount: convertedBalance,
            noSymbol: false,
          }),
        )
      }
    }
  }, [data, convertMoneyAmount, formatMoneyAmount, from, to, selectedDirection])

  if (loading) return <Text>{LL.common.soon()}</Text>
  if (error) return <Text>{LL.common.error()}</Text>

  const filteredTransactionsByDirection = filterTransactionsByDirection(
    filterTransactionsByDate(
      data?.me?.defaultAccount?.transactions?.edges?.map((edge) => edge.node) || [],
      from,
      to,
    ),
    selectedDirection,
  )

  const orderedTransactions = orderAndConvertTransactionsByDate(
    filteredTransactionsByDirection,
    convertMoneyAmount,
  )

  return (
    <Screen>
      <View style={styles.container}>
        <DateRangeDisplay from={from} to={to} />
        <Text style={styles.totalText}>
          {LL.reports.total()}:{"\nUSD"} {balance}{" "}
          {balanceInDisplayCurrency !== balance && (
            <Text>{`( ~${balanceInDisplayCurrency} )`}</Text>
          )}
        </Text>
        <View style={styles.filterContainer}>
          <Button
            title="All"
            type={selectedDirection === null ? "solid" : "outline"}
            onPress={() => setSelectedDirection(undefined)}
          />
          <Button
            title="Received"
            type={selectedDirection === TxDirection.Receive ? "solid" : "outline"}
            onPress={() => setSelectedDirection(TxDirection.Receive)}
          />
          <Button
            title="Sent"
            type={selectedDirection === TxDirection.Send ? "solid" : "outline"}
            onPress={() => setSelectedDirection(TxDirection.Send)}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          {orderedTransactions.map((tx) => (
            <View key={tx.id} style={styles.transactionRow}>
              <View style={styles.transactionDetailsRow}>
                <Text style={styles.dateText}>{tx.displayDate}</Text>
                <Text style={styles.txDirectionText}>{tx.direction}</Text>
                <Text style={styles.amountText}>{tx.settlementDisplayAmount}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <Button
          style={styles.button}
          onPress={() =>
            exportTransactionsToHTML({
              transactions: orderedTransactions,
              from,
              to,
              totalAmount: balance,
              balanceInDisplayCurrency,
              currencySymbol: "USD",
            })
          }
        >
          Export as HTML
        </Button>
        <View style={styles.spacer} />
        <Button
          style={styles.button}
          onPress={() =>
            exportTransactionsToPDF({
              transactions: orderedTransactions,
              from,
              to,
              totalAmount: balance,
              balanceInDisplayCurrency,
              currencySymbol: "USD",
            })
          }
        >
          Export as PDF
        </Button>
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: colors.black,
  },
  scrollView: {
    marginBottom: 16,
  },
  transactionRow: {
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: colors.grey4,
  },
  transactionDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  txDirectionText: {
    fontSize: 14,
    color: colors.black,
    textAlign: "center",
    flex: 1,
  },
  amountText: {
    fontSize: 14,
    color: colors.black,
    textAlign: "right",
    flex: 1,
  },
  button: {
    marginVertical: "auto",
    marginHorizontal: "auto",
    paddingHorizontal: 40,
  },
  spacer: {
    height: 3,
  },
}))
