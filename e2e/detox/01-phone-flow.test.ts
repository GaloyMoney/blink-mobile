import { expect } from "detox"

import { testEnvironment, timeout, phoneNumber, otp } from "./utils/config"

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
    const environment = testEnvironment()

    const buildBtn = element(by.id("logo-button"))
    // Wait for 2 mins because metro bundler might not finish sync
    await waitFor(buildBtn).toBeVisible().withTimeout(1200000)
    await buildBtn.multiTap(3)

    const logoutBtn = element(by.id("logout button"))
    await expect(logoutBtn).toBeVisible()

    const envBtn = element(by.id(`${environment} Button`))
    const developerScreenSV = by.id("developer-screen-scroll-view")

    await waitFor(envBtn)
      .toBeVisible()
      .whileElement(developerScreenSV)
      .scroll(200, "down", NaN, 0.85)
    await envBtn.tap()

    const saveChangesBtn = element(by.id("Save Changes"))
    await saveChangesBtn.tap()

    const stagingInstanceText = element(by.text(`Galoy Instance: ${environment}`))
    await waitFor(stagingInstanceText).toBeVisible().withTimeout(10000)

    await tap(by.id("Back"))
  })

  it("login as an user", async () => {
    await tap(by.id(LL.GetStartedScreen.createAccount()))

    const telephoneInput = element(by.id("telephoneNumber"))
    await waitFor(telephoneInput).toBeVisible().withTimeout(timeout)
    await telephoneInput.clearText()
    await telephoneInput.typeText(phoneNumber)
    await tap(by.id(LL.PhoneLoginInitiateScreen.sms()))

    const otpInput = element(by.id("oneTimeCode"))
    try {
      await waitFor(otpInput).toBeVisible().withTimeout(timeout)
      await otpInput.clearText()
      await otpInput.typeText(otp)
    } catch {
      /* empty */
    }

    await waitFor(element(by.text(LL.HomeScreen.myAccounts())))
      .toBeVisible()
      .withTimeout(timeout)
  })
})
