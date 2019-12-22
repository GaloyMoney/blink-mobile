import { DataStoreModel, DataStore, 
  FiatAccount, FiatAccountModel, 
  Rates, RatesModel,
  LndStore, LndModel
} from "./data-store"
import { defaultDataStore } from "../root-store/default-state"
import { AccountType } from "../../screens/accounts-screen/AccountType"
import { CurrencyType } from "./CurrencyType"

test("can be created", () => {
  const instance: DataStore = DataStoreModel.create({})

  expect(instance).toBeTruthy()
})

test("can be created bis - test for duplicated account creation", () => {
  const instance: DataStore = DataStoreModel.create({})

  expect(instance).toBeTruthy()
})


test("fiat accounts have balance and currency", () => {
  const instance: FiatAccount = FiatAccountModel.create({balance: 100})
  
  expect(instance.type).toBe(AccountType.Checking)
  expect(instance.currency).toBe(CurrencyType.USD)
  expect(instance.balance).toBe(100)
})

test("fiat updates correctly from server", async () => {
  const instance: FiatAccount = FiatAccountModel.create({})
  
  await instance.update()

  expect(instance.transactions).toHaveLength(20)
})

test("btc accounts have balance and currency", () => {
  const instance: LndStore = LndModel.create({confirmedBalance: 100})
  
  expect(instance.type).toBe(AccountType.Bitcoin)
  expect(instance.currency).toBe(CurrencyType.BTC)
  expect(instance.balance).toBe(100)
})


test("rates returns value with last_price", () => {
  const instance: Rates = RatesModel.create({})
  
  expect(instance[CurrencyType.USD]).toBe(1)
  expect(instance[CurrencyType.BTC]).toBe(0.0001)
})


test("default state can be instanciate", () => {
  const instance: DataStore = DataStoreModel.create(defaultDataStore)

  expect(instance.accounts).toHaveLength(3)
  expect(instance.total_usd_balance).toBe(1854.5674)
  expect(instance.usd_balances).toEqual(
      { Checking: 1245.12, Bitcoin: 609.4474 }
  )

})

test("I can get every account from using account[] view", () => {
  const instance: DataStore = DataStoreModel.create({})

  console.log(instance.account(AccountType.Checking))

  expect(instance.account(AccountType.Checking).type).toBe(AccountType.Checking)
  expect(instance.account(AccountType.Bitcoin).type).toBe(AccountType.Bitcoin)

})

test("I can get my balances updated", async () => {
  const instance: DataStore = DataStoreModel.create({})

  await instance.update_transactions()

  expect(instance.account(AccountType.Checking).balance).toBe(1245.12)
})