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

export const addLargeAmount = async (LL: TranslationFunctions) => {
  await tap(by.id("Amount Input Button"))
  await tap(by.id("Key 5"))
  await tap(by.id("Key ."))
  await tap(by.id("Key 0"))
  await tap(by.id("Key 0"))
  await tap(by.id(LL.AmountInputScreen.setAmount()))
  await waitFor(element(by.id("Amount Input Button")))
    .toBeVisible()
    .withTimeout(timeout)
}

export const slideSlider = async () => {
  const slider = element(by.id("slider"))
  await waitFor(slider).toBeVisible().withTimeout(timeout)
  await slider.swipe("right", "fast", 0.9, 0.5, 0.5)
}

export const verifyTextPresent = async (text: string) => {
  const el = element(by.text(text))
  await waitFor(el).toBeVisible().withTimeout(timeout)
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
