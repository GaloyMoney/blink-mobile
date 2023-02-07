import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../.storybook/views"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { TransactionDetail } from "@app/navigation/stack-param-lists"

type RouteData = {
  params: TransactionDetail
}

const route: RouteData = {
  params: {
    __typename: "Transaction",
    date: "2021-08-03T20:12:50.000Z",
    date_format: "Tue Aug 03 2021 15:12:50 GMT-0500",
    date_nice_print: "hace 21 horas",
    text: "Add a comment",
    id: "6235dae37f4f0102b6cca792",
    status: "SUCCESS",
    direction: "RECEIVE",
    memo: null,
    createdAt: 1647696611,
    settlementCurrency: "USD",
    settlementAmount: 500,
    settlementFee: 0,
    settlementPrice: {
      __typename: "Price",
      base: 999616128000,
      offset: 12,
      formattedAmount: "",
      currencyUnit: "BTCSAT",
    },
    initiationVia: {
      __typename: "InitiationViaLn",
      paymentHash: "efef76ca1018a61dd381238d3925da44510304f9193953fe6d28b988505c6fb5",
    },
    settlementVia: {
      __typename: "SettlementViaIntraLedger",
      counterPartyWalletId: "test",
      counterPartyUsername: null,
    },
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
