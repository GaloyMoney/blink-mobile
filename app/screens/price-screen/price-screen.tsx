import { useApolloClient } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { BalanceHeader } from "../../components/balance-header"
import { PriceGraphDataInjected } from "../../components/price-graph"
import { Screen } from "../../components/screen"
import { balanceBtc } from "../../graphql/query"
import { palette } from "../../theme/palette"
import { AccountType } from "../../utils/enum"

export interface PriceScreenProps {
  account: AccountType
  store: RootStore
  navigation: StackNavigationProp<any, any>
}

export const PriceScreen: React.FC<PriceScreenProps> = () => {
  const client = useApolloClient()

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Screen backgroundColor={palette.white} preset="scroll" style={{ flex: 1 }}>
      <BalanceHeader currency="BTC" amount={balanceBtc(client)} />
      <PriceGraphDataInjected />
    </Screen>
  )
}
