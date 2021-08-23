import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import moment from "moment"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { TransactionDetailScreen } from "./transaction-detail-screen"
import { AccountType } from "../../utils/enum"

const route = {
  params: {
    currency: "BTC",
    account: AccountType.Bitcoin,
    amount: 100,
    created_at: moment("2020-04-23T21:03:35.190Z"),
    hash: "3cc849279ba298b587a34cabaeffc5ecb3a044bbf97c516fab7ede9d1af77cfa",
    type: "invoice",
    description: "This is my description",
    destination: "0d1ea4c256cd50a2a7ccbfd22b3d9959f6fd30bd840b9ff3c7c65ee4e21df06d",
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
