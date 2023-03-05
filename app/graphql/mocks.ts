import {
  BalanceHeaderDocument,
  CurrencyListDocument,
  DisplayCurrencyDocument,
  LnInvoiceCreateDocument,
  LnNoAmountInvoiceCreateDocument,
  MainAuthedDocument,
  MainUnauthedDocument,
  RealtimePriceDocument,
  ReceiveBtcDocument,
  ReceiveUsdDocument,
  ReceiveWrapperScreenDocument,
  SendBitcoinConfirmationScreenDocument,
  SendBitcoinDestinationDocument,
  SendBitcoinDetailsScreenDocument,
} from "./generated"

// TODO: put in __tests__ folder?
// will it work for storybooks?
// should not be in production build
// no harm but will increase bundle size

const mocks = [
  {
    request: {
      query: SendBitcoinDestinationDocument,
    },
    result: {
      data: {
        globals: {
          network: "signet",
          __typename: "Globals",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            wallets: [
              {
                id: "f79792e3-282b-45d4-85d5-7486d020def5",
                __typename: "BTCWallet",
              },
              {
                id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
                __typename: "UsdWallet",
              },
            ],
            __typename: "ConsumerAccount",
          },
          contacts: [
            {
              id: "extheo",
              username: "extheo",
              __typename: "UserContact",
            },
            {
              id: "test",
              username: "test",
              __typename: "UserContact",
            },
            {
              id: "galoytest",
              username: "galoytest",
              __typename: "UserContact",
            },
          ],
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
  {
    request: {
      query: SendBitcoinConfirmationScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            btcWallet: {
              __typename: "BTCWallet",
              balance: 88413,
              displayBalance: 158,
            },
            usdWallet: {
              __typename: "UsdWallet",
              balance: 158,
            },
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: SendBitcoinDetailsScreenDocument,
    },
    result: {
      data: {
        globals: {
          network: "mainnet",
          __typename: "Globals",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWallet: {
              id: "f79792e3-282b-45d4-85d5-7486d020def5",
              walletCurrency: "BTC",
              __typename: "BTCWallet",
            },
            btcWallet: {
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
              walletCurrency: "BTC",
              balance: 88413,
              displayBalance: 158,
              __typename: "BTCWallet",
            },
            usdWallet: {
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
              walletCurrency: "USD",
              balance: 158,
              displayBalance: 158,
              __typename: "UsdWallet",
            },
            wallets: [
              {
                id: "f79792e3-282b-45d4-85d5-7486d020def5",
                walletCurrency: "BTC",
                balance: 88413,
                __typename: "BTCWallet",
              },
              {
                id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
                walletCurrency: "USD",
                balance: 158,
                __typename: "UsdWallet",
              },
            ],
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: LnNoAmountInvoiceCreateDocument,
      variables: {
        input: { walletId: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8", memo: undefined },
      },
    },
    result: {
      data: {
        lnNoAmountInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc1p3lwh3npp5z5wkmy86gcww9u2h8tuekqmfz4pwlpkk4rfst8cm7jwzm8fklldsdqqcqzpuxqyz5vqsp52fv968tprd3dqkuqsq78nw8s0xr9zn7rx686ukq2rfnsdf27pwtq9qyyssqhc7m7d3gfvdsywx956d3u3h45xyf7xurc6yv5qxysspjnhhxstl3wet525ldxn3x6xd0g58nk6wuvwle0fhn5sul396za3qs5ma7zxsqjvklym",
            paymentHash:
              "0ab7a842956c260e1270a46d09e964ac15e0623d4f2d8d4b62af5a608f4c5e06",
            paymentSecret:
              "8c92e0f1db2374806ec11e8fea3d1513171bee9304dd54e33a4f2c0347b42006",
            __typename: "LnNoAmountInvoice",
          },
          errors: [],
          __typename: "LnNoAmountInvoicePayload",
        },
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
  {
    request: {
      query: ReceiveWrapperScreenDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWallet: {
              walletCurrency: "BTC",
              __typename: "BTCWallet",
              id: "f79792e3-282b-45d4-85d5-7486d020def5",
            },
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: ReceiveUsdDocument,
    },
    result: {
      data: {
        globals: {
          __typename: "Globals",
          network: "mainnet",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            usdWallet: {
              __typename: "UsdWallet",
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
            },
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: ReceiveBtcDocument,
    },
    result: {
      data: {
        globals: {
          network: "mainnet",
          __typename: "Globals",
        },
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            __typename: "ConsumerAccount",
            btcWallet: {
              id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
              __typename: "BTCWallet",
            },
          },
          __typename: "User",
        },
      },
    },
  },
  {
    request: {
      query: LnNoAmountInvoiceCreateDocument,
      variables: {
        input: { walletId: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8", memo: undefined },
      },
    },
    result: {
      data: {
        lnNoAmountInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc1p3lwh3npp5z5wkmy86gcww9u2h8tuekqmfz4pwlpkk4rfst8cm7jwzm8fklldsdqqcqzpuxqyz5vqsp52fv968tprd3dqkuqsq78nw8s0xr9zn7rx686ukq2rfnsdf27pwtq9qyyssqhc7m7d3gfvdsywx956d3u3h45xyf7xurc6yv5qxysspjnhhxstl3wet525ldxn3x6xd0g58nk6wuvwle0fhn5sul396za3qs5ma7zxsqjvklym",
            paymentHash:
              "0ab7a842956c260e1270a46d09e964ac15e0623d4f2d8d4b62af5a608f4c5e06",
            paymentSecret:
              "8c92e0f1db2374806ec11e8fea3d1513171bee9304dd54e33a4f2c0347b42006",
            __typename: "LnNoAmountInvoice",
          },
          errors: [],
          __typename: "LnNoAmountInvoicePayload",
        },
      },
    },
  },
  {
    request: {
      query: LnNoAmountInvoiceCreateDocument,
      variables: {
        input: { walletId: "f091c102-6277-4cc6-8d81-87ebf6aaad1b", memo: undefined },
      },
    },
    result: {
      data: {
        lnNoAmountInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc1p3lwh3npp5z5wkmy86gcww9u2h8tuekqmfz4pwlpkk4rfst8cm7jwzm8fklldsdqqcqzpuxqyz5vqsp52fv968tprd3dqkuqsq78nw8s0xr9zn7rx686ukq2rfnsdf27pwtq9qyyssqhc7m7d3gfvdsywx956d3u3h45xyf7xurc6yv5qxysspjnhhxstl3wet525ldxn3x6xd0g58nk6wuvwle0fhn5sul396za3qs5ma7zxsqjvklym",
            paymentHash:
              "0ab7a842956c260e1270a46d09e964ac15e0623d4f2d8d4b62af5a608f4c5e06",
            paymentSecret:
              "8c92e0f1db2374806ec11e8fea3d1513171bee9304dd54e33a4f2c0347b42006",
            __typename: "LnNoAmountInvoice",
          },
          errors: [],
          __typename: "LnNoAmountInvoicePayload",
        },
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
  {
    request: {
      query: LnInvoiceCreateDocument,
      variables: {
        input: {
          walletId: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
          amount: 4000,
        },
      },
    },
    result: {
      data: {
        lnInvoiceCreate: {
          invoice: {
            paymentRequest:
              "lnbc40u1p3l39h0pp5refkulpe27nqn2y0s3zp0w6cp9ytsnk8z9azjf8vv3tg6rekthvqdqqcqzpuxqyz5vqsp5vml3855dh0s2gxu08l0254fp79c9a5c5ec99rdtqzjn6jy0vmf8s9qyyssqffc0zsstezkuy4kuz4ngddjw03j0me0k6qcjhl65pqpxczy32qqzsvjtcl8s6mwqkp4zrcwajtv79pv355cmks2d5qtn44ys06gcxwgparfnzt",
            paymentHash:
              "8ade86efb48a39271289c078d7d2fe3a765e0e4a3d74adfdc4fbf57f08c3b87d",
            paymentSecret:
              "9af1183f4cd6626db38bcfc13077642302cde04f6a10ace37ba5af5691559aa8",
            satoshis: 4000,
            __typename: "LnInvoice",
          },
          errors: [],
          __typename: "LnInvoicePayload",
        },
      },
    },
  },
  {
    request: {
      query: RealtimePriceDocument,
    },
    result: {
      data: {
        me: {
          __typename: "User",
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          defaultAccount: {
            __typename: "Account",
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            realtimePrice: {
              btcSatPrice: {
                base: 24015009766,
                offset: 12,
                currencyUnit: "USDCENT",
                __typename: "PriceOfOneSat",
              },
              denominatorCurrency: "NGN",
              id: "67b6e1d2-04c8-509a-abbd-b1cab08575d5",
              timestamp: 1677184189,
              usdCentPrice: {
                base: 100000000,
                offset: 6,
                currencyUnit: "USDCENT",
                __typename: "PriceOfOneUsdCent",
              },
              __typename: "RealtimePrice",
            },
          },
        },
      },
    },
  },
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
      query: MainUnauthedDocument,
    },
    result: {
      data: {
        __typename: "Query",
        globals: {
          __typename: "Globals",
          network: "mainnet",
        },
        mobileVersions: {
          __typename: "MobileVersions",
          platform: "iOS",
          currentSupported: 100,
          minSupported: 100,
        },
      },
    },
  },
  {
    request: {
      query: MainAuthedDocument,
    },
    result: {
      data: {
        me: {
          id: "70df9822-efe0-419c-b864-c9efa99872ea",
          language: "",
          username: "test1",
          phone: "+50365055539",
          defaultAccount: {
            id: "84b26b88-89b0-5c6f-9d3d-fbead08f79d8",
            defaultWalletId: "f79792e3-282b-45d4-85d5-7486d020def5",
            transactions: {
              pageInfo: {
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: "63e685aeaa07c2f5296b9a06",
                endCursor: "63e685a2aa07c2f5296b98e1",
                __typename: "PageInfo",
              },
              edges: [
                {
                  cursor: "63e685aeaa07c2f5296b9a06",
                  node: {
                    __typename: "Transaction",
                    id: "63e685aeaa07c2f5296b9a06",
                    status: "SUCCESS",
                    direction: "RECEIVE",
                    memo: null,
                    createdAt: 1676051886,
                    settlementAmount: 1,
                    settlementFee: 0,
                    settlementCurrency: "USD",
                    settlementPrice: {
                      base: 1000000000000,
                      offset: 12,
                      currencyUnit: "USDCENT",
                      formattedAmount: "1",
                      __typename: "Price",
                    },
                    initiationVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "InitiationViaIntraLedger",
                    },
                    settlementVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "SettlementViaIntraLedger",
                    },
                  },
                  __typename: "TransactionEdge",
                },
                {
                  cursor: "63e685aeaa07c2f5296b9a03",
                  node: {
                    __typename: "Transaction",
                    id: "63e685aeaa07c2f5296b9a03",
                    status: "SUCCESS",
                    direction: "SEND",
                    memo: null,
                    createdAt: 1676051886,
                    settlementAmount: -92,
                    settlementFee: 0,
                    settlementCurrency: "BTC",
                    settlementPrice: {
                      base: 10869565217,
                      offset: 12,
                      currencyUnit: "USDCENT",
                      formattedAmount: "0.010869565217391304",
                      __typename: "Price",
                    },
                    initiationVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "InitiationViaIntraLedger",
                    },
                    settlementVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "SettlementViaIntraLedger",
                    },
                  },
                  __typename: "TransactionEdge",
                },
                {
                  cursor: "63e685a2aa07c2f5296b98e1",
                  node: {
                    __typename: "Transaction",
                    id: "63e685a2aa07c2f5296b98e1",
                    status: "SUCCESS",
                    direction: "RECEIVE",
                    memo: null,
                    createdAt: 1676051874,
                    settlementAmount: 2,
                    settlementFee: 0,
                    settlementCurrency: "USD",
                    settlementPrice: {
                      base: 1000000000000,
                      offset: 12,
                      currencyUnit: "USDCENT",
                      formattedAmount: "1",
                      __typename: "Price",
                    },
                    initiationVia: {
                      paymentHash:
                        "9d0bf1eb42753c5a1991998c7cc06ace22ce119cdff4c0a7095284ccaf48e847",
                      __typename: "InitiationViaLn",
                    },
                    settlementVia: {
                      counterPartyWalletId: null,
                      counterPartyUsername: null,
                      __typename: "SettlementViaIntraLedger",
                    },
                  },
                  __typename: "TransactionEdge",
                },
              ],
              __typename: "TransactionConnection",
            },
            wallets: [
              {
                id: "f79792e3-282b-45d4-85d5-7486d020def5",
                balance: 88413,
                walletCurrency: "BTC",
                __typename: "BTCWallet",
              },
              {
                id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
                balance: 158,
                walletCurrency: "USD",
                __typename: "UsdWallet",
              },
            ],
            btcWallet: {
              id: "f79792e3-282b-45d4-85d5-7486d020def5",
              balance: 88413,
              displayBalance: 10, // FIXME
            },
            usdWallet: {
              id: "f091c102-6277-4cc6-8d81-87ebf6aaad1b",
              displayBalance: 0.158, // FIXME
            },
            __typename: "ConsumerAccount",
          },
          __typename: "User",
        },
      },
    },
  },
]

export default mocks
