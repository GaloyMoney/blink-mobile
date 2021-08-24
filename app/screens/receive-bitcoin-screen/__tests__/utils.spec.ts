import { getFullUri } from "../utils"

describe("getFullUri", () => {
  it("should return a prefixed bitcoin uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "bitcoin",
    })

    expect(uri).toBe("bitcoin:btc1234567890address")
  })

  it("should return a non-prefixed bitcoin uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "bitcoin",
      prefix: false,
    })

    expect(uri).toBe("btc1234567890address")
  })

  it("should contain amount in the uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "bitcoin",
      amount: 100,
    })

    expect(uri).toBe(`bitcoin:btc1234567890address?amount=${100 / 10 ** 8}`)
  })

  it("should contain memo in the uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "bitcoin",
      memo: "will not forget",
    })

    expect(uri).toBe(`bitcoin:btc1234567890address?message=will%2520not%2520forget`)
  })

  it("should contain memo and amount in the uri", () => {
    const uri = getFullUri({
      input: "btc1234567890address",
      type: "bitcoin",
      amount: 100,
      memo: "will not forget",
    })

    expect(uri).toBe(
      `bitcoin:btc1234567890address?amount=${
        100 / 10 ** 8
      }&message=will%2520not%2520forget`,
    )
  })

  it("should return a non-prefixed lightning uri", () => {
    const uri = getFullUri({
      input: "lnurl12567890",
      type: "lightning",
    })

    expect(uri).toBe("lnurl12567890")
  })

  it("should return return an uppercase string", () => {
    const uri = getFullUri({
      input: "lnurl12567890",
      uppercase: true,
      type: "lightning",
    })

    expect(/^[^a-z]*$/g.test(uri)).toBe(true)
  })
})
