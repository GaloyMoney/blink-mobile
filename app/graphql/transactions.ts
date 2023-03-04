import { TransactionFragment } from "./generated"

import { TranslationFunctions } from "@app/i18n/i18n-types"
import { sameDay, sameMonth } from "../utils/date"
import { SectionTransactions } from "@app/screens/transaction-history/index.types"

const isToday = (tx: TransactionFragment) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx: TransactionFragment) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx: TransactionFragment) => sameMonth(tx.createdAt, new Date())

type PriceHistoryScreen = TranslationFunctions["PriceHistoryScreen"]

export const groupTransactionsByDate = ({
  txs,
  PriceHistoryScreen,
}: {
  txs: TransactionFragment[]
  PriceHistoryScreen: PriceHistoryScreen
}) => {
  const sections: SectionTransactions[] = []

  const today: TransactionFragment[] = []
  const yesterday: TransactionFragment[] = []
  const thisMonth: TransactionFragment[] = []
  const before: TransactionFragment[] = []

  for (const tx of txs) {
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
    sections.push({ title: PriceHistoryScreen.today(), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: PriceHistoryScreen.yesterday(), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: PriceHistoryScreen.thisMonth(), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: PriceHistoryScreen.prevMonths(), data: before })
  }

  return sections
}
