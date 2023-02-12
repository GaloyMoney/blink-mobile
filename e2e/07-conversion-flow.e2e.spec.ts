import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"

describe("Conversion Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  it("Click on Transfer Icon", async () => {
    const transferButton = await $(selector("Transfer Icon", "Other"))
    await transferButton.waitForDisplayed({ timeout })
    await transferButton.click()
  })

  it("Click on amount", async () => {
    const amountInput = await $(selector("usd-input", "Other"))
    const switchButton = await $(selector("switch-button", "Other"))
    await amountInput.waitForDisplayed({ timeout })
    await amountInput.click()
    await amountInput.setValue("2")
    await switchButton.click()
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Click on Convert", async () => {
    const convertButton = await $(selector(LL.common.convert(), "Button"))
    await convertButton.waitForDisplayed({ timeout })
    await convertButton.isEnabled()
    await convertButton.click()
  })

  it("Get Green Checkmark success and Navigate to HomeScreen", async () => {
    const currentBalanceHeader = await $(selector("Current Balance Header", "StaticText"))
    await currentBalanceHeader.waitForDisplayed({ timeout })
  })
})
