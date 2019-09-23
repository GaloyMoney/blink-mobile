
import { Blockchain } from "./blockchain"

test("can be created", () => {
    const instance: Blockchain = new Blockchain()
    instance.setup()
    
    const address = "xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz"

    instance.getWallet(address).then((result) => 
      expect(result).toMatchObject({kind: "ok", balance: 490868})
    )

  })