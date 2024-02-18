import { TranslationFunctions } from "../../../app/i18n/i18n-types"
import { timeout } from "./config"

export const tap = async (match: Detox.NativeMatcher) => {
  const el = element(match)
  await waitFor(el).toBeVisible().withTimeout(timeout)
  await el.tap()
}

export const addSmallAmount = async (LL: TranslationFunctions) => {
  await tap(by.id("Amount Input Button"))
  await tap(by.id("Key ."))
  await tap(by.id("Key 0"))
  await tap(by.id("Key 2"))
  await tap(by.id(LL.AmountInputScreen.setAmount()))
  await waitFor(element(by.id("Amount Input Button")))
    .toBeVisible()
    .withTimeout(timeout)
}

export const waitForHomeScreen = async (LL: TranslationFunctions) => {
  const el = element(by.id(LL.HomeScreen.myAccounts()))
  await waitFor(el)
    .toBeVisible()
    .withTimeout(timeout * 3)
}

export const verifyTextPresent = async (text: string) => {
  const el = element(by.text(text))
  await waitFor(el).toBeVisible().withTimeout(timeout)
}
