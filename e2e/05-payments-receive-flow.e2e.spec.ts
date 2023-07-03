import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  enter2CentsIntoNumberPad,
  scrollDown,
  selector,
  clickBackButton,
  clickButton,
  clickIcon,
  waitTillOnHomeScreen,
  payAmountInvoice,
  payNoAmountInvoice,
  clickPressable,
  waitTillTextDisplayed,
} from "./utils"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Receive BTC Amount Payment Flow", () => {
  let invoice: string
  const memo = "memo"

  it("Click Receive", async () => {
    await clickIcon(LL.HomeScreen.receive())
  })

  it("Click Request Specific Amount", async () => {
    await clickPressable(LL.ReceiveWrapperScreen.addAmount())
    // we need to wait for the notifications permissions pop up
    // and click allow before we can continue
    await browser.pause(4000)
  })

  it("Enter Amount", async () => {
    await enter2CentsIntoNumberPad(LL)
  })

  it("Checks that the invoice is updated", async () => {
    const btcMoneyAmount = await $(selector("btc-payment-amount", "StaticText"))
    await btcMoneyAmount.waitForDisplayed({ timeout })
    expect(btcMoneyAmount).toBeDisplayed()
  })

  it("clicks on set a note button", async () => {
    await scrollDown()
    await clickPressable(LL.ReceiveWrapperScreen.setANote())
  })

  it("sets a memo or note", async () => {
    const memoInput = await $(selector(LL.SendBitcoinScreen.note(), "TextView"))
    await memoInput.waitForDisplayed({ timeout })
    await memoInput.click()
    await memoInput.setValue(memo)
    await clickButton(LL.ReceiveWrapperScreen.updateInvoice())

    // FIXME: this is a bug. we should not have to double tap here.
    await browser.pause(1000)
    await clickButton(LL.ReceiveWrapperScreen.updateInvoice())
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
      await clickButton("Close")
    } else {
      // get from clipboard in android
      const invoiceBase64 = await browser.getClipboard()
      invoice = Buffer.from(invoiceBase64, "base64").toString()
      expect(invoice).toContain("lntbs")
    }
  })

  it("External User Pays the BTC Invoice through API", async () => {
    const { result, paymentStatus } = await payAmountInvoice({ invoice, memo })
    expect(paymentStatus).toBe("SUCCESS")
    expect(result).toBeTruthy()
  })

  it("Wait for Green check for BTC Payment", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout })
  })

  it("Go back to main screen", async () => {
    await clickBackButton()
  })
})

describe("Receive BTC Amountless Invoice Payment Flow", () => {
  let invoice: string

  it("Click Receive", async () => {
    await clickIcon(LL.HomeScreen.receive())
  })

  it("checks if this is a no amount invoice", async () => {
    await waitTillTextDisplayed(LL.ReceiveWrapperScreen.flexibleAmountInvoice())
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
    const { result, paymentStatus } = await payNoAmountInvoice({
      invoice,
      walletCurrency: "BTC",
    })
    expect(paymentStatus).toBe("SUCCESS")
    expect(result).toBeTruthy()
  })

  it("Wait for Green check for BTC Payment", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForExist({ timeout })
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
      await clickButton("Close")
    } else {
      // get from clipboard in android
      const invoiceBase64 = await browser.getClipboard()
      invoice = Buffer.from(invoiceBase64, "base64").toString()
      expect(invoice).toContain("lntbs")
    }
  })

  it("External User Pays the USD Invoice through API", async () => {
    const { paymentStatus } = await payNoAmountInvoice({
      invoice,
      walletCurrency: "USD",
    })
    expect(paymentStatus).toBe("SUCCESS")
  })

  it("Wait for Green Check for USD Payment", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout })
  })

  it("Go back to main screen", async () => {
    await clickBackButton()
    await waitTillOnHomeScreen()
  })
})
