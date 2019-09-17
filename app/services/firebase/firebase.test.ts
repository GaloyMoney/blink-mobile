import { Firebase } from "./firebase"

test("get Transactions", async () => {
  let api = new Firebase()
  api.setup()

  let { transactions } = await api.getTransactions()  

  expect(transactions).toHaveLength(20)
})

test("get Balance", async () => {
  let api = new Firebase()
  api.setup()

  let { balances } = await api.getBalances()  

  expect(balances.Checking).toBe(1245.12)
  expect(balances.Saving).toBe(2500)
})