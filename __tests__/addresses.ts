import { validPayment } from "../app/utils/parsing"

// more test address can be found at: https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/fixtures/address.json

it('bitcoin address 1', () => {  
  const p2pkh = "1KP2uzAZYoNF6U8BkMBRdivLNujwSjtAQV";
  const p2sh = "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy";
  const bech32 = "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4";
  const bech32_2 = "bc1qdx09anw82zhujxzzsn56mruv8qvd33czzy9apt";

  const checkOnChain = (address) => {
    const {valid, addressType, errorMessage} = validPayment(address)
    expect(valid).toBeTruthy()
    expect(addressType).toBe("onchain")
    // console.log(errorMessage)
  }
  
  checkOnChain(p2pkh)
  checkOnChain(p2sh)
  checkOnChain(bech32)
  checkOnChain(bech32_2)
})