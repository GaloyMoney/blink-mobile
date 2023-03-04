import { LocalizedString } from "typesafe-i18n"
import { TransactionFragment } from "../../graphql/generated"

export type SectionTransactions = {
  data: TransactionFragment[]
  title: LocalizedString
}
