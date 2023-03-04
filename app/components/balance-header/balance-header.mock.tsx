import {
  BalanceHeaderDocument,
  CurrencyListDocument,
  DisplayCurrencyDocument,
} from "@app/graphql/generated"

export const mocksBalanceHeader = [
  {
    request: {
      query: BalanceHeaderDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            __typename: "ConsumerAccount",
            btcWallet: {
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
              __typename: "BTCWallet",
              displayBalance: 158,
            },
            usdWallet: {
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
              __typename: "UsdWallet",
              displayBalance: 158,
            },
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: CurrencyListDocument,
    },
    result: {
      data: {
        currencyList: [
          {
            __typename: "Currency",
            fractionDigits: 2,
            id: "USD",
            flag: "🇺🇸",
            name: "US Dollar",
            symbol: "$",
          },
          {
            __typename: "Currency",
            fractionDigits: 2,
            id: "EUR",
            flag: "🇪🇺",
            name: "Euro",
            symbol: "€",
          },
        ],
      },
    },
  },
  {
    request: {
      query: DisplayCurrencyDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            __typename: "ConsumerAccount",
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "EUR",
          },
        },
      },
    },
  },
]
