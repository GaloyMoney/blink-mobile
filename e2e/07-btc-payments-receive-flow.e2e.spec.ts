import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"
import { payInvoice } from "./utils/graphql"

describe("Btc Receive Payment Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  let invoice: string
  let paymentStatus: string | null | undefined

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.HomeScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("Click Copy Invoice", async () => {
    let copyInvoiceButton
    if (process.env.E2E_DEVICE === "ios") {
      copyInvoiceButton = await $('(//XCUIElementTypeOther[@name="Copy Invoice"])[2]')
    } else {
      copyInvoiceButton = await $(selector("Copy Invoice", "Button"))
    }
    await copyInvoiceButton.waitForDisplayed({ timeout })
    await copyInvoiceButton.click()
  })

  it("Get Invoice from clipboard (android) or share link (ios)", async () => {
    await browser.pause(2000)
    const invoiceBase64 = await browser.getClipboard()
    invoice = Buffer.from(invoiceBase64, "base64").toString()
    expect(invoice).toContain("lntbs")
  })

  it("External User Pays the Invoice through API", async () => {
    const payResult = await payInvoice(invoice, "BTC")
    if (payResult.data) {
      if ("lnNoAmountInvoicePaymentSend" in payResult.data) {
        paymentStatus = payResult.data?.lnNoAmountInvoicePaymentSend.status
      }
    }
    expect(paymentStatus).toBe("SUCCESS")
    expect(payResult).toBeTruthy()
  })

  it("Wait for Green check", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout: 10000 })
    expect(await successCheck.isDisplayed()).toBeTruthy()
  })

  it("Go back to main screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(2000)
  })
})
