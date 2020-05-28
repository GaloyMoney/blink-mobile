import { Instance, types } from "mobx-state-tree"
import { RootStoreBase } from "./RootStore.base"
import { CurrencyType, AccountType } from "../utils/enum"
import { values } from "mobx"

export interface RootStoreType extends Instance<typeof RootStore.Type> {}

export const OnboardingModel = types.model("Onboarding", {
    getStarted: types.optional(types.boolean, false),
  }).actions(self => ({
    getStartedCompleted() { self.getStarted = true },
  }))

export const RootStore = RootStoreBase
  .props({
    onboarding: types.optional(OnboardingModel, {})
  })  
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    },
  }))
  .views((self) => ({
    // workaround on the fact key can't be enum
    rate(currency: CurrencyType) {
      if (currency === CurrencyType.USD) {
        return 1
      } else if (currency === CurrencyType.BTC) {
        const p = values(self.prices)
        if (p.length > 0) {
          return p[p.length - 1].o
        } else {
          return 1 // FIXME
        }
      } else {
        throw Error(`currency ${currency} doesnt't exist`)
      }
    },
    get user() {
      // FIXME there must be a better way to do this
      return values(self.users)[0]
    },
    get earnArray() {
      const earnsArray = values(self.earns)
      return earnsArray
    },
    get earnedSat() {
      return self.earnArray
        .filter(item => item.completed)
        .reduce((acc, value) => value.amount + acc, 0)
    },
    wallet(currency) {
      return values(self.wallets).filter(item => item.currency === currency)[0]
    },
    balances({ currency, account }) {
      const balances = {}

      const btcConversion = self.rate("BTC") / self.rate(currency)

      balances[AccountType.Bitcoin] = self.wallet("BTC").balance * btcConversion
      balances[AccountType.Bank] = self.wallet("USD").balance / self.rate(currency)
      balances[AccountType.BankAndBitcoin] =
        balances[AccountType.Bank] + balances[AccountType.Bitcoin]

      return balances[account]
    },
  }))
    // return in BTC instead of SAT
    // get getInBTC() {
    //   return (self.BTC * Math.pow(10, 8))
    // }
