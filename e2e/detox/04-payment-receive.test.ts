import "detox"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { setLocalAndLoginWithAccessToken, waitForHomeScreen } from "./utils/common-flows"
import { timeout, ALICE_TOKEN } from "./utils/config"
import { tap } from "./utils/controls"

loadLocale("en")
const LL = i18nObject("en")

// Make sure all tests in this file reset back to home screen because tests reuse same session in this file
beforeAll(async () => {
  await device.launchApp({ newInstance: true })
  await setLocalAndLoginWithAccessToken(ALICE_TOKEN, LL)
})

// Only for the LN tests do we send funds from bob's account for alice to receive
describe("Receive: LN BTC Amountless", () => {
  it("receive ln btc amountless", async () => {
    await tap(by.id(LL.HomeScreen.receive()))

    const amountInput = element(by.id("Amount Input Button"))
    await waitFor(amountInput).toBeVisible().withTimeout(timeout)

    await tap(by.id(LL.common.back()))
    await waitForHomeScreen(LL)
  })

  // it("check if latest transaction has been updated", async () => {
  //   const tx = element(by.id(`transaction-by-index-0`))
  //   await waitFor(tx)
  //     .toBeVisible()
  //     .withTimeout(timeout * 10)
  //   await tx.tap()

  //   await verifyTextPresent(LL.TransactionDetailScreen.spent())

  //   await tap(by.id("close"))
  //   await waitForHomeScreen(LL)
  // })
})
// describe("Receive: LN BTC $0.02 Amount", () => {})
// describe("Receive: LN Stablesats Amountless", () => {})
// describe("Receive: LN Stablesats $0.02 Amount", () => {})

// describe("Receive: Onchain BTC", () => {})
// describe("Receive: Onchain Stablesats", () => {})

// describe("Receive: Paycode", () => {})
