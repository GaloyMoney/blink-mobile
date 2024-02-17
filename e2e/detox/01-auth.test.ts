import "detox"

import { timeout, otp, ALICE_PHONE, ALICE_EMAIL } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

import { getKratosCode } from "./utils/commandline"
import { setLocalEnvironment, tap } from "./utils/controls"

describe("Login/Register Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  beforeAll(async () => {
    await device.launchApp()
  })

  it("set environment", setLocalEnvironment)

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

  it("add an email", async () => {
    await tap(by.id("menu"))
    await tap(by.text(LL.common.account()))
    await tap(by.text(LL.AccountScreen.emailAuthentication()))

    const emailInput = element(by.id(LL.EmailRegistrationInitiateScreen.placeholder()))
    await waitFor(emailInput).toBeVisible().withTimeout(timeout)
    await emailInput.clearText()
    await emailInput.typeText(ALICE_EMAIL)
    await tap(by.id(LL.EmailRegistrationInitiateScreen.send()))

    const codeInput = element(by.id("000000"))
    await waitFor(codeInput).toBeVisible().withTimeout(timeout)
    const code = getKratosCode(ALICE_EMAIL)
    await codeInput.clearText()
    await codeInput.typeText(code)

    await tap(by.label(LL.common.ok()))
  })

  it("logout", async () => {
    await tap(by.id(LL.AccountScreen.logOutAndDeleteLocalData()))
    await tap(by.label(LL.AccountScreen.IUnderstand()))
    await tap(by.label(LL.common.ok()))
  })

  it("reset to local environment", setLocalEnvironment)

  it("log back in, with the new email", async () => {
    await tap(by.id("email-button"))

    const emailInput = element(by.id(LL.EmailRegistrationInitiateScreen.placeholder()))
    await waitFor(emailInput).toBeVisible().withTimeout(timeout)
    await emailInput.clearText()
    await emailInput.typeText(ALICE_EMAIL)
    await tap(by.id(LL.EmailRegistrationInitiateScreen.send()))

    const codeInput = element(by.id("000000"))
    await waitFor(codeInput).toBeVisible().withTimeout(timeout)
    const code = getKratosCode(ALICE_EMAIL)
    await codeInput.clearText()
    await codeInput.typeText(code)
  })

  it("verify we are in the same account as we started with", async () => {
    await tap(by.id("menu"))
    await tap(by.text(LL.common.account()))

    const phoneNumber = element(by.text(ALICE_PHONE))
    await waitFor(phoneNumber).toBeVisible().withTimeout(timeout)
  })
})
