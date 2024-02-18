import "detox"

import { timeout, ALICE_PHONE, ALICE_EMAIL } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

import { getKratosCode } from "./utils/commandline"

import { tap } from "./utils/controls"
import { loginAs, setLocalEnvironment, waitForAccountScreen } from "./utils/common-flows"

describe("Login/Register Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  it("set environment", setLocalEnvironment)

  it("login as an user", loginAs(ALICE_PHONE, LL))

  it("add an email", async () => {
    await tap(by.id("menu"))
    await tap(by.text(LL.common.account()))
    await tap(by.text(LL.AccountScreen.emailAuthentication()))

    const emailInput = element(by.id(LL.EmailRegistrationInitiateScreen.placeholder()))
    await waitFor(emailInput).toBeVisible().withTimeout(timeout)
    await emailInput.clearText()
    await emailInput.typeText(ALICE_EMAIL)
    await tap(by.id(LL.EmailRegistrationInitiateScreen.send()))

    const codeInput = element(by.id("code-input"))
    await waitFor(codeInput).toBeVisible().withTimeout(timeout)

    const code = await getKratosCode(ALICE_EMAIL)
    await codeInput.clearText()
    await codeInput.typeText(code)

    await tap(by.text(LL.common.ok()))
  })

  it("logout", async () => {
    await waitForAccountScreen(LL)

    const logoutBtn = element(by.id(LL.AccountScreen.logOutAndDeleteLocalData()))
    const accountScreenSV = by.id("account-screen-scroll-view")

    await waitFor(logoutBtn)
      .toBeVisible()
      .whileElement(accountScreenSV)
      .scroll(400, "down", NaN, 0.85)
    await logoutBtn.tap()

    await tap(by.text(LL.AccountScreen.IUnderstand()))
    await tap(by.text(LL.common.ok()))
  })

  it("reset to local environment", setLocalEnvironment)

  it("log back in, with the new email", async () => {
    await tap(by.id("email-button"))

    const emailInput = element(by.id(LL.EmailRegistrationInitiateScreen.placeholder()))
    await waitFor(emailInput).toBeVisible().withTimeout(timeout)
    await emailInput.clearText()
    await emailInput.typeText(ALICE_EMAIL)
    await tap(by.id(LL.EmailRegistrationInitiateScreen.send()))

    const codeInput = element(by.id("code-input"))
    await waitFor(codeInput).toBeVisible().withTimeout(timeout)

    const code = await getKratosCode(ALICE_EMAIL)
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
