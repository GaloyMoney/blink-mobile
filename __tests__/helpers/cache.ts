import { InMemoryCache } from "@apollo/client"
import { PriceCacheDocument, MainQueryDocument } from "@app/graphql/generated"

export const cacheWallet = (cache: InMemoryCache, balance: number): void => {
  // TODO: figure out why no tests are failing with these commented out!!
  // const transactions = [
  //   {
  //     __typename: "Transaction",
  //     amount: -70,
  //     created_at: 1628021570,
  //     date: "2021-08-03T20:12:50.000Z",
  //     date_format: "Tue Aug 03 2021 15:12:50 GMT-0500",
  //     date_nice_print: "hace 21 horas",
  //     description: "Add a comment",
  //     fee: 1,
  //     feeUsd: 0.0003797510546875,
  //     hash: "e982613a64e410d65f60fd3fd10d704e100b3c390f99c58f787dad9e6e748135",
  //     id: "6109a34204b9a6f81c74c7d7",
  //     isReceive: false,
  //     pending: false,
  //     text: "-$0.03",
  //     type: "payment",
  //     usd: 0.026582573828124997,
  //     username: null,
  //   },
  //   {
  //     __typename: "Transaction",
  //     amount: -10,
  //     created_at: 1627328473,
  //     date: "2021-07-26T19:41:13.000Z",
  //     date_format: "Mon Jul 26 2021 14:41:13 GMT-0500",
  //     date_nice_print: "hace 9 días",
  //     description: "to Bitcoin",
  //     fee: 0,
  //     feeUsd: 0,
  //     hash: null,
  //     id: "60ff0fd95c95bd83528ad9b0",
  //     isReceive: false,
  //     pending: false,
  //     text: "-$0.0040",
  //     type: "on_us",
  //     usd: 0.003969998828125,
  //     username: "Bitcoin",
  //   },
  //   {
  //     __typename: "Transaction",
  //     amount: 1,
  //     created_at: 1623602166,
  //     date: "2021-06-13T16:36:06.000Z",
  //     date_format: "Sun Jun 13 2021 11:36:06 GMT-0500",
  //     date_nice_print: "hace 2 meses",
  //     description: "whatIsBitcoin",
  //     fee: 0,
  //     feeUsd: 0,
  //     hash: "a73651e6b7612f80ad2ff2676d1bf788218e95bce3d2cdf4e57cb5379e6592b1",
  //     id: "60c633f6c6fbba6d6c74b352",
  //     isReceive: true,
  //     pending: false,
  //     text: "$0.0004",
  //     type: "on_us",
  //     usd: 0.0003693000390625,
  //     username: "BitcoinBeachMarketing",
  //   },
  // ]

  cache.writeQuery({
    query: MainQueryDocument,
    variables: { isAuthed: true },
    data: {
      globals: {
        __typename: "Globals",
      },
      quizQuestions: [],
      me: {
        id: "BitcoinBeach",
        username: "BitcoinBeach",
        language: "",
        phone: "",
        quizQuestions: [],
        defaultAccount: {
          id: "8e8ed189-4da5-4729-b457-8ef9c069fa6a",
          defaultWalletId: "8e8ed189-4da5-4729-b457-8ef9c069fa6a",
          wallets: [
            {
              __typename: "BTCWallet",
              id: "8e8ed189-4da5-4729-b457-8ef9c069fa6a",
              balance,
              walletCurrency: "BTC",
              transactions: [],
            },
          ],
        },
      },
      mobileVersions: [
        {
          platform: "android",
          currentSupported: 100,
          minSupported: 50,
        },
        {
          platform: "ios",
          currentSupported: 100,
          minSupported: 50,
        },
      ],
    },
  })
}

export const cachePrice = (cache: InMemoryCache): void => {
  cache.writeQuery({
    query: PriceCacheDocument,
    data: {
      price: 0.03966375,
    },
  })
}
