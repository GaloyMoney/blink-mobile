import React from "react"
import { ComponentMeta } from "@storybook/react-native"
import { WalletSummary } from "./wallet-summary"
import { WalletCurrency } from "@app/graphql/generated"
import { MockedProvider } from "@apollo/client/testing"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { Text } from "@rneui/base"

const styles = EStyleSheet.create({
  view: { padding: 10, margin: 10, width: 300 },
  wrapper: { marginBottom: 10, marginTop: 5 },
  wrapperOutside: { marginVertical: 10 },
})

export default {
  title: "Wallet Summary",
  decorators: [
    (fn) => (
      <MockedProvider>
        <View style={styles.view}>{fn()}</View>
      </MockedProvider>
    ),
  ],
} as ComponentMeta<typeof WalletSummary>

const Wrapper = ({ children, text }) => (
  <View style={styles.wrapperOutside}>
    <Text style={styles.wrapper}>{text}</Text>
    {children}
  </View>
)

export const Default = () => (
  <View>
    <Wrapper text="BTC">
      <WalletSummary
        amountType="SEND"
        settlementAmount={{
          currency: WalletCurrency.Btc,
          amount: 2000,
        }}
        txDisplayAmount={129.2}
        txDisplayCurrency="USD"
      />
    </Wrapper>
    <Wrapper text="USD">
      <WalletSummary
        amountType="SEND"
        settlementAmount={{
          currency: WalletCurrency.Usd,
          amount: 2000,
        }}
        txDisplayAmount={200}
        txDisplayCurrency="USD"
      />
    </Wrapper>
  </View>
)
