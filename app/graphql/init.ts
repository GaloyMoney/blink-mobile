import { gql } from "@apollo/client"

export const INITWALLET = gql`
  query InitWallet {
    wallet {
      id
      balance
      currency
      transactions {
        id
      }
    }
    buildParameters {
      id
      minBuildNumberAndroid
      minBuildNumberIos
      lastBuildNumberAndroid
      lastBuildNumberIos
    }
  }
`

// FIXME TODO: add __typename for all values

export const initQuery = {
  wallet: [
    {
      __typename: "Wallet",
      id: "USD",
      currency: "USD",
      balance: 0,
      transactions: [],
    },
    {
      __typename: "Wallet",
      id: "BTC",
      currency: "BTC",
      balance: 0,
      transactions: [],
    },
  ],
  earnList: [
    {
      id: "walletDownloaded",
      value: 1,
      completed: false,
    },
    {
      id: "walletActivated",
      value: 1,
      completed: false,
    },
    {
      id: "whatIsBitcoin",
      value: 1,
      completed: false,
    },
    {
      id: "sat",
      value: 2,
      completed: false,
    },
    {
      id: "whereBitcoinExist",
      value: 5,
      completed: false,
    },
    {
      id: "whoControlsBitcoin",
      value: 5,
      completed: false,
    },
    {
      id: "copyBitcoin",
      value: 5,
      completed: false,
    },
    {
      id: "moneyImportantGovernement",
      value: 10,
      completed: false,
    },
    {
      id: "moneyIsImportant",
      value: 10,
      completed: false,
    },
    {
      id: "whyStonesShellGold",
      value: 10,
      completed: false,
    },
    {
      id: "moneyEvolution",
      value: 10,
      completed: false,
    },
    {
      id: "coincidenceOfWants",
      value: 10,
      completed: false,
    },
    {
      id: "moneySocialAggrement",
      value: 10,
      completed: false,
    },
    {
      id: "WhatIsFiat",
      value: 10,
      completed: false,
    },
    {
      id: "whyCareAboutFiatMoney",
      value: 10,
      completed: false,
    },
    {
      id: "GovernementCanPrintMoney",
      value: 10,
      completed: false,
    },
    {
      id: "FiatLosesValueOverTime",
      value: 10,
      completed: false,
    },
    {
      id: "OtherIssues",
      value: 10,
      completed: false,
    },
    {
      id: "LimitedSupply",
      value: 20,
      completed: false,
    },
    {
      id: "Decentralized",
      value: 20,
      completed: false,
    },
    {
      id: "NoCounterfeitMoney",
      value: 20,
      completed: false,
    },
    {
      id: "HighlyDivisible",
      value: 20,
      completed: false,
    },
    {
      id: "securePartOne",
      value: 20,
      completed: false,
    },
    {
      id: "securePartTwo",
      value: 20,
      completed: false,
    },
    {
      id: "freeMoney",
      value: 50,
      completed: false,
    },
    {
      id: "custody",
      value: 100,
      completed: false,
    },
    {
      id: "digitalKeys",
      value: 100,
      completed: false,
    },
    {
      id: "backupWallet",
      value: 500,
      completed: false,
    },
    {
      id: "fiatMoney",
      value: 100,
      completed: false,
    },
    {
      id: "bitcoinUnique",
      value: 100,
      completed: false,
    },
    {
      id: "moneySupply",
      value: 100,
      completed: false,
    },
    {
      id: "newBitcoin",
      value: 100,
      completed: false,
    },
    {
      id: "creator",
      value: 100,
      completed: false,
    },
    {
      id: "volatility",
      value: 50000,
      completed: false,
    },
    {
      id: "activateNotifications",
      value: 500,
      completed: false,
    },
    {
      id: "phoneVerification",
      value: 2000,
      completed: false,
    },
    {
      id: "firstLnPayment",
      value: 1000,
      completed: false,
    },
    {
      id: "transaction",
      value: 500,
      completed: false,
    },
    {
      id: "paymentProcessing",
      value: 500,
      completed: false,
    },
    {
      id: "decentralization",
      value: 500,
      completed: false,
    },
    {
      id: "privacy",
      value: 500,
      completed: false,
    },
    {
      id: "mining",
      value: 500,
      completed: false,
    },
    {
      id: "inviteAFriend",
      value: 5000,
      completed: false,
    },
    {
      id: "bankOnboarded",
      value: 10000,
      completed: false,
    },
    {
      id: "buyFirstSats",
      value: 10000,
      completed: false,
    },
    {
      id: "debitCardActivation",
      value: 10000,
      completed: false,
    },
    {
      id: "firstCardSpending",
      value: 10000,
      completed: false,
    },
    {
      id: "firstSurvey",
      value: 10000,
      completed: false,
    },
    {
      id: "activateDirectDeposit",
      value: 10000,
      completed: false,
    },
    {
      id: "doubleSpend",
      value: 500,
      completed: false,
    },
    {
      id: "exchangeHack",
      value: 500,
      completed: false,
    },
    {
      id: "energy",
      value: 500,
      completed: false,
    },
    {
      id: "difficultyAdjustment",
      value: 500,
      completed: false,
    },
    {
      id: "dollarCostAveraging",
      value: 500,
      completed: false,
    },
    {
      id: "scalability",
      value: 500,
      completed: false,
    },
    {
      id: "lightning",
      value: 500,
      completed: false,
    },
    {
      id: "moneyLaundering",
      value: 500,
      completed: false,
    },
    {
      id: "tweet",
      value: 1000,
      completed: false,
    },
  ],
}
