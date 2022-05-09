import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import moment from "moment"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { AccountType } from "../../utils/enum"
import { TransactionDetail } from "@app/navigation/stack-param-lists"

//{ "__typename": "Transaction", "id": "6235dae37f4f0102b6cca792", "status": "SUCCESS", "direction": "RECEIVE", "memo": null, "createdAt": 1647696611, "settlementAmount": 500, "settlementFee": 0, "settlementPrice": { "__typename": "Price", "base": 999616128000, "offset": 12 }, "initiationVia": { "__typename": "InitiationViaLn", "paymentHash": "efef76ca1018a61dd381238d3925da44510304f9193953fe6d28b988505c6fb5" }, "settlementVia": { "__typename": "SettlementViaIntraLedger", "counterPartyWalletId": null, "counterPartyUsername": null }, "walletType": "USD", "isReceive": true, "isPending": false, "description": "From BitcoinBeach Wallet", "usdAmount": 4.99808064 }
// {"__typename":"Transaction","id":"6270500ca8866d2fe2e97905","status":"SUCCESS","direction":"SEND","memo":null,"createdAt":1651527692,"settlementAmount":-293,"settlementFee":5,"settlementPrice":{"__typename":"Price","base":38634558594,"offset":12},"initiationVia":{"__typename":"InitiationViaLn","paymentHash":"0fa1a2a7e2fb9e99f354b4e4b32ae7b70bb871f406b8298941ea0b86b37e316b"},"settlementVia":{"__typename":"SettlementViaLn","paymentSecret":null},"walletType":"BTC","isReceive":false,"isPending":false,"description":"Invoice","usdAmount":-0.11319925668042001}

type RouteData = {
  params: TransactionDetail
}

const route: RouteData = {
  params: { "__typename": "Transaction", "id": "6235dae37f4f0102b6cca792", "status": "SUCCESS", "direction": "RECEIVE", "memo": null, "createdAt": 1647696611, "settlementAmount": 500, "settlementFee": 0, "settlementPrice": { "base": 999616128000, "offset": 12, formattedAmount: "" }, "initiationVia": { "__typename": "InitiationViaLn", "paymentHash": "efef76ca1018a61dd381238d3925da44510304f9193953fe6d28b988505c6fb5" }, "settlementVia": { "__typename": "SettlementViaIntraLedger", "counterPartyWalletId": null, "counterPartyUsername": null }, "walletType": "USD", "isReceive": true, "isPending": false, "description": "From BitcoinBeach Wallet", "usdAmount": 4.99808064 }
}


// const route: RouteData = {
//   params: {
//     tx: {
//       currency: "BTC",
//       account: AccountType.Bitcoin,
//       amount: 100,
//       created_at: moment("2020-04-23T21:03:35.190Z"),
//       hash: "3cc849279ba298b587a34cabaeffc5ecb3a044bbf97c516fab7ede9d1af77cfa",
//       type: "invoice",
//       description: "This is my description",
//       destination: "0d1ea4c256cd50a2a7ccbfd22b3d9959f6fd30bd840b9ff3c7c65ee4e21df06d",
//       usd: 100,
//       feeUsd: 0.1,
//       fee: 5,
//       date_format: "10/06/2021",
//     },
//   },
// }

storiesOf("Transaction Detail", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <TransactionDetailScreen route={route} />
      </UseCase>
    </Story>
  ))
