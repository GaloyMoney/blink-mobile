import { TransactionFragment } from "@app/graphql/generated"
import { LocalizedString } from "typesafe-i18n"

export type SectionTransactions = {
  data: TransactionFragment[]
  title: LocalizedString
}
