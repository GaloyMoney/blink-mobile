import "detox"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { waitForHomeScreen, setLocalAndLoginWithAccessToken } from "./utils/common-flows"
import { timeout, ALICE_USERNAME, ALICE_TOKEN } from "./utils/config"
import { tap, verifyTextPresent } from "./utils/controls"

describe("Intraledger Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
    await setLocalAndLoginWithAccessToken(ALICE_TOKEN, LL)
  })

  it("go to conversion screen", async () => {
    if (device.getPlatform() === "android") {
      await tap(by.id(LL.ConversionDetailsScreen.title()))
    } else {
      await tap(by.id(LL.HomeScreen.send()))

      const usernameInput = element(by.id(LL.SendBitcoinScreen.placeholder()))
      await waitFor(usernameInput).toBeVisible().withTimeout(timeout)
      await usernameInput.clearText()
      await usernameInput.typeText(ALICE_USERNAME)
      await tap(by.id(LL.common.next()))
    }
  })

  it("convert", async () => {
    await tap(by.id("convert-25%"))
    await tap(by.id(LL.common.next()))
    await tap(by.id(LL.common.convert()))
    await waitForHomeScreen(LL)
  })

  it("check if last two transactions indicate conversion", async () => {
    // The home screen displays the top transactions
    const tx1 = element(by.id("transaction-by-index-0"))
    await waitFor(tx1)
      .toBeVisible()
      .withTimeout(timeout * 10)
    await tx1.tap()

    await verifyTextPresent("From Local User")
    await tap(by.id("close"))
  })
})
