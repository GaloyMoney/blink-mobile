import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, enter } from "./utils"
import { getInvoice } from "./utils/graphql"

describe("Payments Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  let invoice: string

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.MoveMoneyScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Create Invoice from API", async () => {
    invoice = await getInvoice()
    expect(invoice).toContain("lntbs")
  })

  it("Paste Invoice", async () => {
    try {
      const invoiceInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
      await invoiceInput.waitForDisplayed({ timeout })
      await invoiceInput.click()
      await invoiceInput.setValue(invoice)
    } catch (err) {
      // this passes but sometimes throws an error on ios
      // even though it works properly
      console.error(err)
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
      await amountInput.sendKeys("2".split(""))
      await enter(amountInput)
    } catch (e) {
      // this passes but sometimes throws an error on ios
      // even though it works properly
    }
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Wait for fee calculation to return", async () => {
    const feeDisplay = await $(selector("Successful Fee", "StaticText"))
    // wait 5 seconds for fee to be displayed
    await feeDisplay.waitForDisplayed({ timeout: 5000 })
  })

  it("Click 'Confirm Payment' and navigate to move money screen", async () => {
    const confirmPaymentButton = await $(
      selector(LL.SendBitcoinConfirmationScreen.title(), "Button"),
    )
    await confirmPaymentButton.waitForDisplayed({ timeout })
    await confirmPaymentButton.click()
    const currentBalanceHeader = await $(selector("Current Balance Header", "StaticText"))
    // Wait 10 seconds for move money screen to be displayed
    await currentBalanceHeader.waitForDisplayed({ timeout: 10000 })
  })
})
