import "detox"

import { timeout, ALICE_USERNAME, ALICE_TOKEN } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

import { tap } from "./utils/controls"
import { setLocalAndLoginWithAccessToken, waitForHomeScreen } from "./utils/common-flows"

describe("Intraledger Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
    await setLocalAndLoginWithAccessToken(ALICE_TOKEN, LL)
  })

  it("initially stablesats funds should be zero", async () => {
    await expect(element(by.id("stablesats-balance"))).toHaveText("$0.00")
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
    await tap(by.id("convert-50%"))
    await tap(by.id(LL.common.next()))
    await tap(by.id(LL.common.convert()))
  })

  it("check if stablesats fund is non-zero", async () => {
    await waitForHomeScreen(LL)
    await expect(element(by.id("stablesats-balance"))).not.toHaveText("$0.00")
  })
})
