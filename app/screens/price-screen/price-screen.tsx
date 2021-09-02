import { useApolloClient } from "@apollo/client"
import { RouteProp } from "@react-navigation/native"
import * as React from "react"
import { BalanceHeader } from "../../components/balance-header"
import { PriceGraphDataInjected } from "../../components/price-graph"
import { Screen } from "../../components/screen"
import { balanceBtc } from "../../graphql/query"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"

type Props = {
  route: RouteProp<RootStackParamList, "priceDetail">
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const PriceScreen: ScreenType = ({ route }: Props) => {
  const client = useApolloClient()
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Screen backgroundColor={palette.white} preset="scroll" style={{ flex: 1 }}>
      <BalanceHeader currency={"BTC"} amount={balanceBtc(client)} />
      <PriceGraphDataInjected />
    </Screen>
  )
}
