import { getFullUri, satsToBTC } from "../../app/utils/wallet"

describe("getFullUri", () => {
  it("returns a prefixed bitcoin uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "BITCOIN_ONCHAIN",
    })

    expect(uri).toBe("bitcoin:btc1234567890address")
  })

  it("returns a non-prefixed bitcoin uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "BITCOIN_ONCHAIN",
      prefix: false,
    })

    expect(uri).toBe("btc1234567890address")
  })

  it("contains amount in the uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "BITCOIN_ONCHAIN",
      amount: 100,
    })

    expect(uri).toBe(`bitcoin:btc1234567890address?amount=${100 / 10 ** 8}`)
  })

  it("contains memo in the uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "BITCOIN_ONCHAIN",
      memo: "will not forget",
    })

    expect(uri).toBe(`bitcoin:btc1234567890address?message=will%2520not%2520forget`)
  })

  it("contains memo and amount in the uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "BITCOIN_ONCHAIN",
      amount: 100,
      memo: "will not forget",
    })

    expect(uri).toBe(
      `bitcoin:btc1234567890address?amount=${
        100 / 10 ** 8
      }&message=will%2520not%2520forget`,
    )
  })

  it("returns a non-prefixed lightning uri", () => {
    const uri = getFullUri({
      input: "lnurl12567890",
      type: "LIGHTNING_BTC",
    })

    expect(uri).toBe("lnurl12567890")
  })

  it("returns return an uppercase string", () => {
    const uri = getFullUri({
      input: "lnurl12567890",
      uppercase: true,
      type: "LIGHTNING_BTC",
    })

    expect(uri).toMatch(/^[^a-z]*$/g)
  })
})

describe("satsToBTC", () => {
  it("returns the correct BTC number", () => {
    expect(satsToBTC(1000)).toBe(0.00001)
    expect(satsToBTC(0)).toBe(0)
    expect(satsToBTC(-1000)).toBe(-0.00001)
  })
})
