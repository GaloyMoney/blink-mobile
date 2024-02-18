import "detox"

import { timeout, ALICE_PHONE, BOB_USERNAME } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

import {
  addSmallAmount,
  tap,
  verifyTextPresent,
  waitForHomeScreen,
} from "./utils/controls"
import { setLocalAndLoginAs } from "./utils/common-flows"

describe("Intraledger Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  it("login alice", setLocalAndLoginAs(ALICE_PHONE, LL))

  it("send to bob", async () => {
    await tap(by.id(LL.HomeScreen.send()))

    const usernameInput = element(by.id(LL.SendBitcoinScreen.placeholder()))
    await waitFor(usernameInput).toBeVisible().withTimeout(timeout)
    await usernameInput.clearText()
    await usernameInput.typeText(BOB_USERNAME)
    await tap(by.id(LL.common.next()))

    await tap(by.id("address-is-right"))
    await tap(by.id(LL.SendBitcoinDestinationScreen.confirmUsernameModal.confirmButton()))

    await addSmallAmount(LL)
    await tap(by.id(LL.common.next()))

    const slider = element(by.id("slider"))
    await waitFor(slider).toBeVisible().withTimeout(timeout)
    await slider.swipe("right", "fast", 0.9, 0.5, 0.5)
  })

  it("check if latest transaction has been updated", async () => {
    await tap(by.id(LL.common.back()))
    await waitForHomeScreen(LL)

    const tx = element(by.text(`${LL.common.to()} ${BOB_USERNAME}`))
    await waitFor(tx).toBeVisible().withTimeout(timeout)
    await tx.tap()

    await verifyTextPresent(LL.TransactionDetailScreen.spent())
    await verifyTextPresent("-$0.02")
  })
})
