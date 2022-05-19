import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { TransactionDetail } from "@app/navigation/stack-param-lists"

type RouteData = {
  params: TransactionDetail
}

const route: RouteData = {
  params: {
    __typename: "Transaction",
    id: "6235dae37f4f0102b6cca792",
    status: "SUCCESS",
    direction: "RECEIVE",
    memo: null,
    createdAt: 1647696611,
    settlementAmount: 500,
    settlementFee: 0,
    settlementPrice: { base: 999616128000, offset: 12, formattedAmount: "" },
    initiationVia: {
      __typename: "InitiationViaLn",
      paymentHash: "efef76ca1018a61dd381238d3925da44510304f9193953fe6d28b988505c6fb5",
    },
    settlementVia: { __typename: "SettlementViaIntraLedger", counterPartyUsername: null },
    walletType: "USD",
    isReceive: true,
    isPending: false,
    description: "From BitcoinBeach Wallet",
    usdAmount: 4.99808064,
  },
}

storiesOf("Transaction Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <TransactionDetailScreen route={route} />
      </UseCase>
    </Story>
  ))
