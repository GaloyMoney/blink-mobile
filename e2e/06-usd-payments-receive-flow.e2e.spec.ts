import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"
import { payInvoice } from "./utils/graphql"

describe("USD Receive Payment Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  let invoice: string
  let paymentStatus: string | null | undefined

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.MoveMoneyScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("Click USD invoice button", async () => {
    const usdInvoiceButton = await $(selector("USD Invoice Button", "Other"))
    await usdInvoiceButton.waitForDisplayed({ timeout: 8000 })
    await usdInvoiceButton.click()
  })

  it("Click Copy Invoice to prompt for notification permission popup", async () => {
    let copyInvoiceButton
    if (process.env.E2E_DEVICE === "ios") {
      copyInvoiceButton = await $('(//XCUIElementTypeOther[@name="Copy Invoice"])[2]')
    } else {
      copyInvoiceButton = await $(selector("Copy Invoice", "Button"))
    }
    await copyInvoiceButton.waitForDisplayed({ timeout })
    await copyInvoiceButton.click()
  })

  it("Get Invoice from clipboard to prompt for notification permission popup", async () => {
    await browser.pause(800)
    const invoiceBase64 = await browser.getClipboard()
    invoice = Buffer.from(invoiceBase64, "base64").toString()
    expect(invoice).toContain("lntbs")
  })

  it("Click OK to allow push notifications", async () => {
    try {
      if (process.env.E2E_DEVICE === "android") {
        const okButton = await $(selector(LL.common.ok(), "Button"))
        await okButton.waitForDisplayed({ timeout: 8000 })
        await okButton.click()
      }
      const allowButton = await $(selector("Allow", "Button"))
      await allowButton.waitForDisplayed({ timeout: 8000 })
      await allowButton.click()
    } catch (e) {
      // keep going, it might have already been clicked
    }
  })

  it("External User Pays the Invoice through API", async () => {
    const payResult = await payInvoice(invoice, "USD")
    if (payResult.data) {
      if ("lnNoAmountUsdInvoicePaymentSend" in payResult.data) {
        paymentStatus = payResult.data?.lnNoAmountUsdInvoicePaymentSend.status
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

  it("go back to main screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(2000)
  })
})
