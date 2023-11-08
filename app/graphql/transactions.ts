import { TransactionFragment, TxStatus } from "./generated"

import { TranslationFunctions } from "@app/i18n/i18n-types"
import { sameDay, sameMonth } from "../utils/date"
import { SectionTransactions } from "@app/screens/transaction-history/index.types"

const isToday = (tx: TransactionFragment) => sameDay(tx.createdAt, new Date())

const isYesterday = (tx: TransactionFragment) =>
  sameDay(tx.createdAt, new Date().setDate(new Date().getDate() - 1))

const isThisMonth = (tx: TransactionFragment) => sameMonth(tx.createdAt, new Date())

type Common = TranslationFunctions["common"]

export const groupTransactionsByDate = ({
  pendingTxs,
  txs,
  common,
}: {
  pendingTxs?: TransactionFragment[]
  txs: TransactionFragment[]
  common: Common
}) => {
  const sections: SectionTransactions[] = []

  const settledTxs = txs.filter((tx) => tx.status !== TxStatus.Pending)

  const today: TransactionFragment[] = []
  const yesterday: TransactionFragment[] = []
  const thisMonth: TransactionFragment[] = []
  const before: TransactionFragment[] = []

  for (const tx of pendingTxs ?? []) {
    today.push(tx)
  }

  for (const tx of settledTxs) {
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
    sections.push({ title: common.today(), data: today })
  }

  if (yesterday.length > 0) {
    sections.push({ title: common.yesterday(), data: yesterday })
  }

  if (thisMonth.length > 0) {
    sections.push({ title: common.thisMonth(), data: thisMonth })
  }

  if (before.length > 0) {
    sections.push({ title: common.prevMonths(), data: before })
  }

  return sections
}
