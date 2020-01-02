import { AccountType } from "../../screens/accounts-screen/AccountType"

export const defaultDataStore = {
  accounts: [{
    transactions: [
      { name: "La Carafe", icon: "ios-wine", amount: -21, cashback: 2202, date: new Date() },
      { name: "Trader Joe's", icon: "ios-cart", amount: -51.25, cashback: 5380, date: new Date('2019-09-08T03:24:00') },
      { name: "Starbucks", icon: "ios-cafe", amount: -8.49, cashback: 896, date: new Date('2019-09-07T03:24:00') },
      { name: "Paycheck", icon: "ios-download", amount: 2150.90, cashback: 564475, date: new Date('2019-09-04T03:24:00') },
      { name: "Counter Cafe", icon: "ios-restaurant", amount: -31.5, cashback: 3313, date: new Date('2019-08-31T03:24:00') },
      { name: "Bought Bitcoin", icon: "logo-bitcoin", amount: -25, cashback: 262694, date: new Date('2019-08-28T03:24:00') },
      { name: "Peet's Coffee", icon: "ios-cafe", amount: -7.64, cashback: 806, date: new Date('2019-08-27T03:24:00') },
      { name: "Lyft", icon: "ios-car", amount: -25.62, cashback: 2690, date: new Date('2019-08-26T03:24:00') },
      { name: "Peet's Coffee", icon: "ios-cafe", amount: -8.49, cashback: 896, date: new Date('2019-08-25T03:24:00') },
      { name: "In-N-Out Burger", icon: "ios-restaurant", amount: -15.75, cashback: 1657, date: new Date('2019-08-24T03:24:00') },
      { name: "Bank transfer", icon: "ios-download", amount: 500, date: new Date('2019-08-23T03:24:00') },
      { name: "The Wine Bar", icon: "ios-wine", amount: -26.25, cashback: 2753, date: new Date('2019-08-22T03:24:00') },
      { name: "Peet's Coffee", icon: "ios-cafe", amount: -8.49, cashback: 896, date: new Date('2019-08-21T03:24:00') },
      { name: "Sundance Cinema", icon: "ios-film", amount: -26.25, cashback: 5797, date: new Date('2019-08-20T03:24:00') },
      { name: "Trader Joe's", icon: "ios-cart", amount: -56.37, cashback: 5918, date: new Date('2019-08-20T03:24:00') },
      { name: "Bank transfer", icon: "ios-download", amount: -100, date: new Date('2019-08-19T03:24:00') },
      { name: "Bought Bitcoin", icon: "logo-bitcoin", amount: -25, cashback: 262694, date: new Date('2019-08-18T03:24:00') },
      { name: "Lyft", icon: "ios-car", amount: -25.62, cashback: 2690, date: new Date('2019-08-17T03:24:00') },
      { name: "Jet Blue", icon: "ios-airplane", amount: -219.45, cashback: 23042, date: new Date('2019-08-16T03:24:00') },
      { name: "Counter Cafe", icon: "ios-restaurant", amount: -55, cashback: 5775, date: new Date('2019-08-15T03:24:00') },
    ],
    balance: 1245.12,
    type: AccountType.Checking,
  }, {
    transactions: [
      { name: "August cash back", icon: "ios-wine", amount: +407070, cashback: 38.65, date: new Date() },
      { name: "August interest", icon: "ios-leaf", amount: +17590, cashback: 5380, date: new Date() },
      { name: "August spare change", icon: "ios-calculator", amount: +813311, cashback: 896, date: new Date() },
      { name: "Paycheck auto buy", icon: "ios-download", amount: 564475, cashback: 564475, date: new Date() },
      { name: "Bought Bitcoin", icon: "logo-bitcoin", amount: 262294, cashback: 262694, date: new Date() },
    ],
    balance: 6094474,
    type: AccountType.Bitcoin,
  }],
  rates: {
    BTC: 0.0001
  }
}

export const defaultStoreState = {
  navigationStore: {},
  dataStore: defaultDataStore
}
