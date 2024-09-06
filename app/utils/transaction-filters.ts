import { TransactionFragment, TxDirection } from "@app/graphql/generated"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import { DisplayCurrency, toUsdMoneyAmount } from "@app/types/amounts"
import { format } from "date-fns"

const filterTransactionsByDate = (
  transactions: TransactionFragment[],
  from: string,
  to: string,
) => {
  const selectedFrom = from ? new Date(from) : null
  const selectedTo = to ? new Date(to) : null

  return transactions.filter((tx) => {
    const txDate = new Date(tx.createdAt * 1000) // Convert seconds to milliseconds
    return (
      (!selectedFrom || txDate >= selectedFrom) && (!selectedTo || txDate <= selectedTo)
    )
  })
}

const filterTransactionsByDirection = (
  transactions: TransactionFragment[],
  direction?: TxDirection,
) => {
  if (!direction) return transactions
  return transactions.filter((tx) => tx.direction === direction)
}

const calculateTotalAmount = (transactions: TransactionFragment[]) =>
  transactions.reduce((sum, tx) => {
    const displayAmount = tx.settlementAmount
    return sum + (isNaN(displayAmount) ? 0 : displayAmount)
  }, 0)

const convertToDisplayCurrency = (
  totalAmount: number,
  convertMoneyAmount?: ConvertMoneyAmount,
) =>
  convertMoneyAmount &&
  convertMoneyAmount(toUsdMoneyAmount(totalAmount * 100), DisplayCurrency)

const formatDate = (date: string) => format(new Date(date), "dd-MMM-yyyy hh:mm a")

const orderAndConvertTransactionsByDate = (
  transactions: TransactionFragment[],
  convertMoneyAmount?: ConvertMoneyAmount,
) => {
  // Sort the transactions by date (newest first)
  const orderedTransactions = transactions.sort((a, b) => b.createdAt - a.createdAt)

  // Map through the transactions and convert amounts, including the display date
  return orderedTransactions.map((tx) => {
    const displayAmount = tx.settlementAmount
    const convertedAmount = convertMoneyAmount?.(
      toUsdMoneyAmount(displayAmount * 100),
      DisplayCurrency,
    )

    return {
      ...tx,
      displayDate: format(new Date(tx.createdAt * 1000), "dd-MMM-yyyy hh:mm a"),
      settlementDisplayAmount:
        convertedAmount && convertedAmount.currencyCode !== "USD"
          ? (convertedAmount.amount / 100).toFixed(2)
          : tx.settlementDisplayAmount,
    }
  })
}

export {
  filterTransactionsByDate,
  filterTransactionsByDirection,
  calculateTotalAmount,
  convertToDisplayCurrency,
  formatDate,
  orderAndConvertTransactionsByDate,
}
