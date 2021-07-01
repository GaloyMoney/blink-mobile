import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "react-native-elements"
import * as React from "react"
import { Text } from "react-native"
import { IconTransaction } from "../icon-transactions"
import { palette } from "../../theme/palette"

export interface TransactionItemProps {
  navigation: StackNavigationProp<any, any>
  tx: Object // TODO
  subtitle: boolean
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  navigation,
  subtitle = false,
}) => {
  const colorFromType = (isReceive) => (isReceive ? palette.green : palette.darkGrey)

  return (
    <ListItem
      // key={props.hash}
      title={tx.description}
      leftIcon={
        <IconTransaction isReceive={tx.isReceive} size={24} pending={tx.pending} />
      }
      containerStyle={
        tx.pending
          ? { backgroundColor: palette.lighterGrey, paddingVertical: 9 }
          : { paddingVertical: 9 }
      }
      rightTitle={<Text style={{ color: colorFromType(tx.isReceive) }}>{tx.text}</Text>}
      onPress={() => navigation.navigate("transactionDetail", { tx })}
      subtitle={subtitle ? tx.date_nice_print : undefined}
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
