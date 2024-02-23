import "detox"

import { timeout, BOB_USERNAME, ALICE_TOKEN } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

import { addAmount, tap, verifyTextPresent, sleep, slideSlider } from "./utils/controls"
import { setLocalAndLoginWithAccessToken, waitForHomeScreen } from "./utils/common-flows"

loadLocale("en")
const LL = i18nObject("en")

// Make sure all tests in this file reset back to home screen because tests reuse same session in this file
beforeAll(async () => {
  await device.launchApp({ newInstance: true })
  await setLocalAndLoginWithAccessToken(ALICE_TOKEN, LL)
})

describe("Intraledger using Username - BTC Amount", () => {
  it("send btc to bob using his username", async () => {
    await tap(by.id(LL.HomeScreen.send()))

    const usernameInput = element(by.id(LL.SendBitcoinScreen.placeholder()))
    await waitFor(usernameInput).toBeVisible().withTimeout(timeout)
    await usernameInput.clearText()
    await usernameInput.typeText(BOB_USERNAME)
    await tap(by.id(LL.common.next()))

    try {
      await tap(by.id("address-is-right"))
      await tap(
        by.id(LL.SendBitcoinDestinationScreen.confirmUsernameModal.confirmButton()),
      )
    } catch {
      /* If this was not the first time that the tests were run, 
         then the address is right popup modal won't appear */
    }

    await addAmount("0.02", LL)
    await tap(by.id(LL.common.next()))

    await slideSlider()
    await sleep(3000)

    await tap(by.id(LL.common.back()))
    await waitForHomeScreen(LL)
  })

  it("check if latest transaction has been updated", async () => {
    const tx = element(by.id(`transaction-by-index-0`))
    await waitFor(tx)
      .toBeVisible()
      .withTimeout(timeout * 10)
    await tx.tap()

    await verifyTextPresent(LL.TransactionDetailScreen.spent())
    await verifyTextPresent("-$0.02")

    await tap(by.id("close"))
    await waitForHomeScreen(LL)
  })
})

describe("Intraledger using Username - USD Amount", () => {
  it("send btc to bob using his username", async () => {
    await tap(by.id(LL.HomeScreen.send()))

    const usernameInput = element(by.id(LL.SendBitcoinScreen.placeholder()))
    await waitFor(usernameInput).toBeVisible().withTimeout(timeout)
    await usernameInput.clearText()
    await usernameInput.typeText(BOB_USERNAME)
    await tap(by.id(LL.common.next()))

    try {
      await tap(by.id("address-is-right"))
      await tap(
        by.id(LL.SendBitcoinDestinationScreen.confirmUsernameModal.confirmButton()),
      )
    } catch {
      /* If this was not the first time that the tests were run, 
         then the address is right popup modal won't appear */
    }

    await tap(by.id("choose-wallet-to-send-from"))
    await tap(by.id("USD"))

    await addAmount("0.02", LL)
    await tap(by.id(LL.common.next()))

    await slideSlider()
    await sleep(3000)

    await tap(by.id(LL.common.back()))
    await waitForHomeScreen(LL)
  })

  it("check if latest transaction has been updated", async () => {
    const tx = element(by.id(`transaction-by-index-0`))
    await waitFor(tx)
      .toBeVisible()
      .withTimeout(timeout * 10)
    await tx.tap()

    await verifyTextPresent(LL.TransactionDetailScreen.spent())
    await verifyTextPresent("-$0.02")

    await tap(by.id("close"))
    await waitForHomeScreen(LL)
  })
})
