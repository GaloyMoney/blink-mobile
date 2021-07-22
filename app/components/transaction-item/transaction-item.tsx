import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "react-native-elements"
import * as React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { IconTransaction } from "../icon-transactions"
import { palette } from "../../theme/palette"
import { query_transactions_wallet_transactions } from "../../graphql/__generated__/query_transactions"
import { ParamListBase } from "@react-navigation/native"

const styles = EStyleSheet.create({
  confirmed: {
    paddingVertical: 9,
  },

  pending: {
    backgroundColor: palette.lighterGrey,
    paddingVertical: 9,
  },
})

export interface TransactionItemProps {
  navigation: StackNavigationProp<ParamListBase>
  tx: query_transactions_wallet_transactions
  subtitle?: boolean
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  navigation,
  subtitle = false,
}: TransactionItemProps) => {
  const colorFromType = (isReceive) => (isReceive ? palette.green : palette.darkGrey)

  return (
    <ListItem
      // key={props.hash}
      containerStyle={tx.pending ? styles.pending : styles.confirmed}
      onPress={() => navigation.navigate("transactionDetail", { tx })}
    >
      <IconTransaction isReceive={tx.isReceive} size={24} pending={tx.pending} />
      <ListItem.Content>
        <ListItem.Title>{tx.description}</ListItem.Title>
        <ListItem.Subtitle>{subtitle ? tx.date_nice_print : undefined}</ListItem.Subtitle>
      </ListItem.Content>
      <Text style={{ color: colorFromType(tx.isReceive) }}>{tx.text}</Text>
    </ListItem>
  )
}
