
import { Blockchain } from "./blockchain"

const address = "xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz"

test("I'm fetching current balance", () => {
  const instance: Blockchain = new Blockchain()
  instance.setup()

  instance.getWallet(address).then((result) => 
    expect(result).toMatchObject({kind: "ok", balance: 490868})
  )
})

test("I'm showing the transactions", () => {
  const instance: Blockchain = new Blockchain()
  instance.setup()
  
  instance.getWallet(address).then((result) => {
    let txs = result.txs
    expect(txs).toHaveLength(12)
    expect(txs[0].moneyIn).toBe(true)
  })
})