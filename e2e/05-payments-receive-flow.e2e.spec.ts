import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"
import { payAmountInvoice, payNoAmountInvoice } from "./utils/graphql"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Receive BTC Amount Payment Flow", () => {
  let invoice: string
  const memo = "memo"

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.HomeScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("Click Request Specific Amount", async () => {
    const requestSpecificAmountButton = await $(
      selector(LL.ReceiveWrapperScreen.addAmount(), "Other"),
    )
    await requestSpecificAmountButton.waitForDisplayed({ timeout })
    await requestSpecificAmountButton.click()
  })

  it("Enter Amount", async () => {
    const usdAmountInput = await $(selector("usd-unit-usd-amount-input", "TextField"))
    await usdAmountInput.waitForDisplayed({ timeout })
    await usdAmountInput.click()
    await usdAmountInput.setValue("2")
  })

  it("Click Toggle Currency", async () => {
    const toggleCurrencyButton = await $(selector("toggle-currency-button", "Other"))
    await toggleCurrencyButton.waitForDisplayed({ timeout })
    await toggleCurrencyButton.click()
  })

  it("Checks that the amount is updated", async () => {
    const usdAmountInput = await $(selector("btc-unit-usd-amount-input", "TextField"))
    const btcAmountInput = await $(selector("btc-unit-btc-amount-input", "TextField"))
    await btcAmountInput.waitForDisplayed({ timeout })
    await usdAmountInput.waitForDisplayed({ timeout })
    const usdAmount = await usdAmountInput.getText()
    const btcAmount = await btcAmountInput.getText()

    expect(usdAmount).not.toEqual("$0.00")
    expect(usdAmount).not.toEqual("NaN")
    expect(btcAmount).not.toEqual("0 sats")
    expect(btcAmount).not.toEqual("NaN sats")
  })

  it("Click Update Invoice", async () => {
    const updateInvoiceButton = await $(
      selector(LL.ReceiveWrapperScreen.updateInvoice(), "Button"),
    )
    await updateInvoiceButton.waitForDisplayed({ timeout })
    await updateInvoiceButton.waitForEnabled()
    await updateInvoiceButton.click()
  })

  it("Checks that the invoice is updated", async () => {
    const btcPaymentAmount = await $(selector("btc-payment-amount", "StaticText"))
    const usdPaymentAmount = await $(selector("usd-payment-amount", "StaticText"))
    await btcPaymentAmount.waitForDisplayed({ timeout })
    await usdPaymentAmount.waitForDisplayed({ timeout })
    expect(btcPaymentAmount).toBeDisplayed()
    expect(usdPaymentAmount).toBeDisplayed()
  })

  it("clicks on set a note button", async () => {
    const setNoteButton = await $(selector(LL.ReceiveWrapperScreen.setANote(), "Other"))
    await setNoteButton.waitForDisplayed({ timeout })
    await setNoteButton.click()
  })

  it("sets a memo or note", async () => {
    let memoInput: WebdriverIO.Element
    const updateInvoiceButton = await $(
      selector(LL.ReceiveWrapperScreen.updateInvoice(), "Button"),
    )
    if (process.env.E2E_DEVICE === "ios") {
      memoInput = await $(selector(LL.SendBitcoinScreen.note(), "Other"))
    } else {
      const select = `new UiSelector().text("${LL.SendBitcoinScreen.note()}").className("android.widget.EditText")`
      memoInput = await $(`android=${select}`)
    }
    await memoInput.waitForDisplayed({ timeout })
    await memoInput.click()
    await memoInput.setValue(memo)
    await updateInvoiceButton.waitForDisplayed({ timeout })
    await updateInvoiceButton.waitForEnabled()
    await updateInvoiceButton.click()
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
    const { result, paymentStatus } = await payAmountInvoice({ invoice, memo })
    expect(paymentStatus).toBe("SUCCESS")
    expect(result).toBeTruthy()
  })

  it("Wait for Green check for BTC Payment", async () => {
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout })
  })

  it("Go back to main screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
  })
})

describe("Receive BTC Amountless Invoice Payment Flow", () => {
  let invoice: string

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.HomeScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("checks if this is a no amount invoice", async () => {
    const flexibleAmount = await $(
      selector(LL.ReceiveWrapperScreen.flexibleAmountInvoice(), "StaticText"),
    )
    await flexibleAmount.waitForDisplayed({ timeout })
    expect(flexibleAmount).toBeDisplayed()
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
    const { result, paymentStatus } = await payNoAmountInvoice({
      invoice,
      walletCurrency: "USD",
    })
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
