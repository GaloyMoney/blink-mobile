import React from "react"
import { Meta } from "@storybook/react-native"
import { WalletSummary } from "./wallet-summary"
import { WalletCurrency } from "@app/graphql/generated"
import { MockedProvider } from "@apollo/client/testing"
import { StyleSheet, View } from "react-native"
import { Text } from "@rneui/base"
import { StoryScreen } from "../../../.storybook/views"

const styles = StyleSheet.create({
  view: { padding: 10, margin: 10, width: 300 },
  wrapper: { marginBottom: 10, marginTop: 5 },
  wrapperOutside: { marginVertical: 10 },
})

export default {
  title: "Wallet Summary",
  decorators: [
    (Story) => (
      <MockedProvider>
        <View style={styles.view}>
          <StoryScreen>{Story()}</StoryScreen>
        </View>
      </MockedProvider>
    ),
  ],
} as Meta<typeof WalletSummary>

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
