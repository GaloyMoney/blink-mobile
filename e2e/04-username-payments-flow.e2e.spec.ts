import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, enter } from "./utils"
import { getInvoice } from "./utils/graphql"

describe("Username Payment Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  const username: string = "extheo"

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.MoveMoneyScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Paste Username", async () => {
    try {
      const usernameInput = await $(
        selector(LL.SendBitcoinScreen.input(), "Other", "[1]"),
      )
      await usernameInput.waitForDisplayed({ timeout })
      await usernameInput.click()
      await browser.pause(500)
      await usernameInput.sendKeys(username.split(""))
      await enter(usernameInput)
      await browser.pause(3000)
    } catch (e) {
      // FIXME: Error if username validation fails
    }
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Add amount", async () => {
    try {
      const amountInput = await $(selector("USD Amount", "TextField"))
      await amountInput.waitForDisplayed({ timeout })
      await amountInput.click()
      await browser.pause(1000)
      await amountInput.sendKeys("2".split(""))
      await enter(amountInput)
    } catch (e) {
      console.error(e)
    }
  })

  it("Click Next", async () => {
    await browser.pause(3000)
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
    await browser.pause(2000)
  })

  it("Click 'Confirm Payment' and get Green Checkmark success", async () => {
    const confirmPaymentButton = await $(
      selector(LL.SendBitcoinConfirmationScreen.title(), "Button"),
    )
    await confirmPaymentButton.waitForDisplayed({ timeout })
    await confirmPaymentButton.click()
    const successCheck = await $(selector(LL.SendBitcoinScreen.success(), "StaticText"))
    await successCheck.waitForDisplayed({ timeout })
    if (!successCheck.isDisplayed()) {
      // wait to throttle the rate limiting
      await browser.pause(30000)
      await confirmPaymentButton.click()
      await successCheck.waitForDisplayed({ timeout })
    }
    expect(successCheck.isDisplayed()).toBeTruthy()
  })
})
