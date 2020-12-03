import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "react-native-elements"
import * as React from "react"
import { IconTransaction } from "../icon-transactions"
import { palette } from "../../theme/palette"
import { Text } from "react-native"


export interface TransactionItemProps {
  navigation: StackNavigationProp<any,any>,
  tx: Object // TODO
}

export const TransactionItem: React.FC<TransactionItemProps> = ({tx, navigation}) => {
  const colorFromType = isReceive => isReceive ? palette.green : palette.darkGrey

  return (<ListItem
    // key={props.hash}
    title={tx.description}
    leftIcon={<IconTransaction
      isReceive={tx.isReceive}
      size={24}
      pending={tx.pending}
    />}
    containerStyle={tx.pending ? {backgroundColor: palette.lighterGrey} : null}
    rightTitle={<Text style={{color: colorFromType(tx.isReceive)}}>{tx.text}</Text>}
    onPress={() => navigation.navigate("transactionDetail", {tx})}
  />)
}