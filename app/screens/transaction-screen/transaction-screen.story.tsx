import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { TransactionScreen } from "./transaction-screen"
import { AccountType, CurrencyType } from "../../utils/enum"

import moment from 'moment'

const transactions = [{
    "amount": 10,
    "description": "moneySocialAggrement",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 5,
    "description": "copyBitcoin",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 5,
    "description": "whoControlsBitcoin",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 5,
    "description": "whereBitcoinExist",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 1,
    "description": "sat",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 1,
    "description": "whatIsBitcoin",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 1,
    "description": "walletDownloaded",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 1,
    "description": "walletActivated",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 1,
    "description": "walletActivated",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 2000,
    "description": "phoneVerification",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  },
  {
    "amount": 2000,
    "description": "phoneVerification",
    "created_at": null,
    "hash": null,
    "type": "paid-invoice"
  }
]


storiesOf("Transaction History", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <TransactionScreen 
          transactions={transactions}
          currency={CurrencyType.BTC}
          // refreshing={true}
          
          />
      </UseCase>
    </Story>
  ))
