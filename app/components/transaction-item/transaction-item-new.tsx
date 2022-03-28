import { ParamListBase } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import "react"

export interface TransactionItemProps {
  navigation: StackNavigationProp<ParamListBase>
  tx: WalletTransaction
  subtitle?: boolean
  hideBalance?: boolean
}

const transactionItemNew = (props: TransactionItemProps) => {}
