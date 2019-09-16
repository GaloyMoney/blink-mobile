import { Firebase } from "./firebase"

test("handles connection errors", async () => {

    let api = new Firebase()
    api.setup()

    let { transactions } = await api.getTransactions()  

    expect(transactions).toHaveLength(20)

  })