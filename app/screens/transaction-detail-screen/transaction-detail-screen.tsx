import * as React from "react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"

export interface TransactionDetailScreenProps extends NavigationScreenProps<{}> {
}

export class TransactionDetailScreen extends React.Component<TransactionDetailScreenProps, {}> {
  render () {
    return (
      <Screen>
        <Text>{this.props.navigation.getParam("name")}</Text>
        <Text>{this.props.navigation.getParam("amount")}</Text>
        <Text>{this.props.navigation.getParam("cashback")}</Text>
        <Text>{this.props.navigation.getParam("date").toString()}</Text>
        <Text>Place de la tour Eiffel, Paris, France</Text>
        <Text>(555) 123 4567</Text>
      </Screen>
    )
  }
}
