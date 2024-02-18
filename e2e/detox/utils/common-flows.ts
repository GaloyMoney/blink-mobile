import { TranslationFunctions } from "../../../app/i18n/i18n-types"

import { otp, timeout } from "./config"
import { tap } from "./controls"

export const waitForAccountScreen = async (LL: TranslationFunctions) => {
  const el = element(by.id(LL.AccountScreen.yourAccountId()))
  await waitFor(el)
    .toBeVisible()
    .withTimeout(timeout * 3)
}

export const waitForHomeScreen = async (LL: TranslationFunctions) => {
  const el = element(by.id(LL.HomeScreen.myAccounts()))
  await waitFor(el)
    .toBeVisible()
    .withTimeout(timeout * 3)
}

export const setLocalEnvironment = async () => {
  const buildBtn = element(by.id("logo-button"))
  await waitFor(buildBtn)
    .toBeVisible()
    // Wait for 5 mins because metro bundler might not finish sync
    .withTimeout(5 * 600000)
  await buildBtn.multiTap(5)

  const logoutBtn = element(by.id("logout button"))
  await waitFor(logoutBtn).toBeVisible().withTimeout(timeout)

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
}

export const loginAs = (phone: string, LL: TranslationFunctions) => async () => {
  await tap(by.id(LL.GetStartedScreen.createAccount()))

  const telephoneInput = element(by.id("telephoneNumber"))
  await waitFor(telephoneInput).toBeVisible().withTimeout(timeout)
  await telephoneInput.clearText()
  await telephoneInput.typeText(phone)
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
}

export const setLocalAndLoginAs =
  (phone: string, LL: TranslationFunctions) => async () => {
    await setLocalEnvironment()
    await loginAs(phone, LL)()
  }
