import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"
import { payInvoice } from "./utils/graphql"

describe("Btc Receive Payment Flow", () => {
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
    if (process.env.E2E_DEVICE === "ios") {
      // on ios, get invoice from share link because copy does not
      // work on physical device for security reasons
      const shareButton = await $('(//XCUIElementTypeOther[@name="Share Invoice"])[2]')
      await shareButton.waitForDisplayed({ timeout })
      await shareButton.click()
      const invoiceSharedScreen = await $('//*[contains(@name,"lntbs")]')
      await invoiceSharedScreen.waitForDisplayed({
        timeout: 8000,
      })
      invoice = await invoiceSharedScreen.getAttribute("name")
      const closeShareButton = await $(selector("Close", "Button"))
      await closeShareButton.waitForDisplayed({ timeout })
      await closeShareButton.click()
    } else {
      // get from clipboard in android
      const invoiceBase64 = await browser.getClipboard()
      invoice = Buffer.from(invoiceBase64, "base64").toString()
      expect(invoice).toContain("lntbs")
    }
  })

  it("External User Pays the Invoice through API", async () => {
    const payResult = await payInvoice({ invoice, walletType: "BTC" })
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
    await successCheck.waitForDisplayed({ timeout })
    expect(await successCheck.isDisplayed()).toBeTruthy()
  })

  it("Go back to main screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(2000)
  })
})
