import { TransactionFragment } from "../../graphql/generated"

export type SectionTransactions = {
  data: TransactionFragment[]
  title: string
}
