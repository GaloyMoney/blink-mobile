import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"
import { payInvoice } from "./utils/graphql"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Receive BTC Payment Flow", () => {
  let invoice: string

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.HomeScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("Click OK to allow push notifications", async () => {
    try {
      if (process.env.E2E_DEVICE === "android") {
        const okButton = await $(selector(LL.common.ok(), "Button"))
        await okButton.waitForDisplayed({ timeout: 8000 })
        await okButton.click()
      }
      const allowButton = await $(selector("Allow", "Button"))
      await allowButton.waitForDisplayed({ timeout })
      await allowButton.click()
    } catch (error) {
      // we don't want to fail the test if the prompt is not found
      console.log("Push notification prompt not found, skipping test")
    }
  })

  it("Click Copy BTC Invoice", async () => {
    let copyInvoiceButton
    if (process.env.E2E_DEVICE === "ios") {
      copyInvoiceButton = await $('(//XCUIElementTypeOther[@name="Copy Invoice"])[2]')
    } else {
      copyInvoiceButton = await $(selector("Copy Invoice", "Button"))
    }
    await copyInvoiceButton.waitForDisplayed({ timeout })
    await copyInvoiceButton.click()
  })

  it("Get BTC Invoice from clipboard (android) or share link (ios)", async () => {
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

  it("External User Pays the BTC Invoice through API", async () => {
    const { result, paymentStatus } = await payInvoice({ invoice, walletType: "BTC" })
    expect(paymentStatus).toBe("SUCCESS")
    expect(result).toBeTruthy()
  })

  it("Wait for Green check for BTC Payment", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout })
  })
})

describe("Receive USD Payment Flow", () => {
  let invoice: string

  it("Click USD invoice button", async () => {
    const usdInvoiceButton = await $(selector("USD Invoice Button", "Other"))
    await usdInvoiceButton.waitForDisplayed({ timeout })
    await usdInvoiceButton.click()
  })

  it("Click Copy USD Invoice", async () => {
    let copyInvoiceButton
    if (process.env.E2E_DEVICE === "ios") {
      copyInvoiceButton = await $('(//XCUIElementTypeOther[@name="Copy Invoice"])[2]')
    } else {
      copyInvoiceButton = await $(selector("Copy Invoice", "Button"))
    }
    await copyInvoiceButton.waitForDisplayed({ timeout })
    await copyInvoiceButton.click()
  })

  it("Get USD Invoice from clipboard (android) or share link (ios)", async () => {
    await browser.pause(2000)
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

  it("External User Pays the USD Invoice through API", async () => {
    const { result, paymentStatus } = await payInvoice({ invoice, walletType: "USD" })
    expect(paymentStatus).toBe("SUCCESS")
    expect(result).toBeTruthy()
  })

  it("Wait for Green Check for USD Payment", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout })
  })

  it("Go back to main screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(2000)
  })
})
