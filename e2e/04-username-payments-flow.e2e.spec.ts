import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, enter } from "./utils"
import { checkUsername } from "./utils/graphql"

describe("Username Payment Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  const username = "test"
  const lnAddress = "test@pay.staging.galoy.io"

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
    const checkBoxButton = await $(
      selector(
        LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress }),
        "Other",
      ),
    )
    const confirmButton = await $(
      selector(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton(), "Button"),
    )
    const isUsernameAvailable = await checkUsername(username)
    if (!isUsernameAvailable) {
      if (checkBoxButton.isDisplayed() || confirmButton.isEnabled()) {
        await checkBoxButton.click()
        await confirmButton.isEnabled()
        await confirmButton.click()
      }
    }
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
    const currentBalanceHeader = await $(selector("Current Balance Header", "StaticText"))
    // Wait 5 seconds for move money screen to be displayed
    await currentBalanceHeader.waitForDisplayed({ timeout: 5000 })
  })
})
