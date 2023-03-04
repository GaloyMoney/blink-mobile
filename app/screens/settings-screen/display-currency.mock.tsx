import { CurrencyListDocument, DisplayCurrencyDocument } from "@app/graphql/generated"

export const mocksDisplayCurrencyScreen = [
  {
    request: {
      query: CurrencyListDocument,
    },
    result: {
      data: {
        currencyList: [
          {
            flag: "🇺🇸",
            id: "USD",
            name: "US Dollar",
            symbol: "$",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇪🇺",
            id: "EUR",
            name: "Euro",
            symbol: "€",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇳🇬",
            id: "NGN",
            name: "Nigerian Naira",
            symbol: "₦",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "",
            id: "XAF",
            name: "CFA Franc BEAC",
            symbol: "FCFA",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇵🇪",
            id: "PEN",
            name: "Peruvian Nuevo Sol",
            symbol: "S/.",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇨🇴",
            id: "COP",
            name: "Colombian Peso",
            symbol: "$",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇧🇷",
            id: "BRL",
            name: "Brazilian Real",
            symbol: "R$",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇬🇹",
            id: "GTQ",
            name: "Guatemalan Quetzal",
            symbol: "Q",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇨🇷",
            id: "CRC",
            name: "Costa Rican Colón",
            symbol: "₡",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇹🇷",
            id: "TRY",
            name: "Turkish Lira",
            symbol: "₤",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇮🇳",
            id: "INR",
            name: "Indian Rupee",
            symbol: "₹",
            fractionDigits: 2,
            __typename: "Currency",
          },
          {
            flag: "🇹🇹",
            id: "TTD",
            name: "Trinidad and Tobago Dollar",
            symbol: "TT$",
            fractionDigits: 2,
            __typename: "Currency",
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
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            displayCurrency: "USD",
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]
