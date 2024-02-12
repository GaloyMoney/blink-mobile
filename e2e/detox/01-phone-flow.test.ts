import { expect } from "detox"

import { timeout, otp, ALICE_PHONE } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

const tap = async (match: Detox.NativeMatcher) => {
  const el = element(match)
  await waitFor(el).toBeVisible().withTimeout(timeout)
  await el.tap()
}

describe("Login with Phone Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  beforeAll(async () => {
    await device.launchApp()
  })

  it("set environment", async () => {
    const buildBtn = element(by.id("logo-button"))
    await waitFor(buildBtn)
      .toBeVisible()
      // Wait for 5 mins because metro bundler might not finish sync
      .withTimeout(5 * 600000)
    await buildBtn.multiTap(3)

    const logoutBtn = element(by.id("logout button"))
    await expect(logoutBtn).toBeVisible()

    const envBtn = element(by.id("Local Button"))
    const developerScreenSV = by.id("developer-screen-scroll-view")

    await waitFor(envBtn)
      .toBeVisible()
      .whileElement(developerScreenSV)
      .scroll(400, "down", NaN, 0.85)
    await envBtn.tap()

    const saveChangesBtn = element(by.id("Save Changes"))
    await saveChangesBtn.tap()

    const stagingInstanceText = element(by.text(`Galoy Instance: Local`))
    await waitFor(stagingInstanceText).toBeVisible().withTimeout(10000)

    await tap(by.id("Back"))
  })

  it("login as an user", async () => {
    await tap(by.id(LL.GetStartedScreen.createAccount()))

    const telephoneInput = element(by.id("telephoneNumber"))
    await waitFor(telephoneInput).toBeVisible().withTimeout(timeout)
    await telephoneInput.clearText()
    await telephoneInput.typeText(ALICE_PHONE)
    await tap(by.id(LL.PhoneLoginInitiateScreen.sms()))

    const otpInput = element(by.id("oneTimeCode"))
    try {
      await waitFor(otpInput).toBeVisible().withTimeout(timeout)
      await otpInput.clearText()
      await otpInput.typeText(otp)
    } catch {
      /* empty because sometimes the page just moves to the next page coz 000000 is default */
    }

    await waitFor(element(by.text(LL.HomeScreen.myAccounts())))
      .toBeVisible()
      .withTimeout(timeout)
  })
})
