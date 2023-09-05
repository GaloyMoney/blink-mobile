import { toUsdMoneyAmount } from "@app/types/amounts"
import { Invoice } from "@app/screens/receive-bitcoin-screen/payment/index.types"

import { createPaymentRequestCreationData } from "@app/screens/receive-bitcoin-screen/payment/payment-request-creation-data"
import { btcWalletDescriptor, defaultParams, usdWalletDescriptor } from "./helpers"

describe("create payment request creation data", () => {
  it("ln on btc wallet", () => {
    const prcd = createPaymentRequestCreationData({
      ...defaultParams,
      defaultWalletDescriptor: btcWalletDescriptor,
    })

    expect(prcd.receivingWalletDescriptor).toBe(btcWalletDescriptor)
    expect(prcd.canSetAmount).toBe(true)
    expect(prcd.canSetMemo).toBe(true)
    expect(prcd.canSetReceivingWalletDescriptor).toBe(true)
  })

  it("ln on usd wallet", () => {
    const prcd = createPaymentRequestCreationData({
      ...defaultParams,
      defaultWalletDescriptor: usdWalletDescriptor,
    })

    expect(prcd.receivingWalletDescriptor).toBe(usdWalletDescriptor)
    expect(prcd.canSetAmount).toBe(true)
    expect(prcd.canSetMemo).toBe(true)
    expect(prcd.canSetReceivingWalletDescriptor).toBe(true)
  })

  it("ln on usd wallet with amount", () => {
    const prcd = createPaymentRequestCreationData({
      ...defaultParams,
      defaultWalletDescriptor: usdWalletDescriptor,
      unitOfAccountAmount: toUsdMoneyAmount(1),
    })

    expect(prcd.settlementAmount).toStrictEqual(toUsdMoneyAmount(1))
    expect(prcd.receivingWalletDescriptor).toBe(usdWalletDescriptor)
    expect(prcd.canSetAmount).toBe(true)
    expect(prcd.canSetMemo).toBe(true)
    expect(prcd.canSetReceivingWalletDescriptor).toBe(true)
  })

  it("cant use paycode", () => {
    const prcd = createPaymentRequestCreationData({
      ...defaultParams,
      type: Invoice.PayCode,
      defaultWalletDescriptor: usdWalletDescriptor,
      username: undefined,
    })

    expect(prcd.canUsePaycode).toBe(false)
  })

  it("can use paycode", () => {
    const prcd = createPaymentRequestCreationData({
      ...defaultParams,
      type: Invoice.PayCode,
      username: "test-username",
      defaultWalletDescriptor: usdWalletDescriptor,
    })

    expect(prcd.canUsePaycode).toBe(true)
    expect(prcd.username).toBe("test-username")
    expect(prcd.canSetAmount).toBe(true)
    expect(prcd.canSetMemo).toBe(false)
    expect(prcd.canSetReceivingWalletDescriptor).toBe(false)
    expect(prcd.receivingWalletDescriptor).toBe(btcWalletDescriptor)
  })

  it("onchain set", () => {
    const prcd = createPaymentRequestCreationData({
      ...defaultParams,
      type: Invoice.OnChain,
    })

    expect(prcd.canSetAmount).toBe(true)
    expect(prcd.canSetMemo).toBe(true)
    expect(prcd.canSetReceivingWalletDescriptor).toBe(true)
    expect(prcd.receivingWalletDescriptor).toBe(defaultParams.defaultWalletDescriptor)
  })
})
