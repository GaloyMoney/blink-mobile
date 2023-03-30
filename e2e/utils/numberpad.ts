import { TranslationFunctions } from "@app/i18n/i18n-types"
import { selector } from "./selector"

export const addSmallAmount = async (LL: TranslationFunctions) => {
  const amountInput = await $(selector("Money Amount Input Button", "Other"))
  await amountInput.waitForDisplayed()
  await amountInput.click()
  const decimalKey = await $(selector("Key .", "Other"))
  await decimalKey.waitForDisplayed()
  await decimalKey.click()
  const zeroKey = await $(selector("Key 0", "Other"))
  await zeroKey.waitForDisplayed()
  await zeroKey.click()
  const number2Key = await $(selector("Key 2", "Other"))
  await number2Key.waitForDisplayed()
  await number2Key.click()
  const setAmountButton = await $(selector(LL.AmountInputScreen.setAmount(), "Button"))
  await setAmountButton.waitForEnabled()
  await setAmountButton.click()

  const updatedAmountInput = await $(selector("Money Amount Input Button", "Other"))
  await updatedAmountInput.waitForDisplayed()
}
