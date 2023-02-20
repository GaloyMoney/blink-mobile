import { bech32 } from "bech32"
import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, goBack } from "./utils"
import { getInvoice } from "./utils/graphql"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Lnurl Pay Flow", () => {
  // see https://github.com/Extheoisah/lnurl-json for reference to lnurl json
  const words = bech32.toWords(
    Buffer.from("https://testlnurl.netlify.app:443/.well-known/lnurlp/extheo", "utf-8"),
  )
  const lnurlp = bech32.encode("lnurl", words, 1000)

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Paste Lnurl", async () => {
    const lnurlInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
    await lnurlInput.waitForDisplayed({ timeout })
    await lnurlInput.click()
    await lnurlInput.setValue(lnurlp)
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Checks if Min and Max amount are displayed", async () => {
    const minMaxAmount = await $(selector("lnurl-min-max", "StaticText"))
    await minMaxAmount.waitForDisplayed({ timeout })
    expect(minMaxAmount).toBeDisplayed()
  })

  it("Go back", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    // we need to wait for the back button to be displayed in the DOM again
    await browser.pause(3000)
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})

describe("Lnurl Withdraw Flow", () => {
  // see https://github.com/Extheoisah/lnurl-json for reference to lnurl json
  const words = bech32.toWords(
    Buffer.from(
      "https://testlnurl.netlify.app/lnurl-withdraw/lnwithdrawresponse.json",
      "utf-8",
    ),
  )
  const lnurlWithdraw = bech32.encode("lnurl", words, 1000)

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Paste Lnurl", async () => {
    const lnurlInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
    await lnurlInput.waitForDisplayed({ timeout })
    await lnurlInput.click()
    await lnurlInput.setValue(lnurlWithdraw)
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Checks if lnwithdraw details are displayed", async () => {
    const description = await $(selector("description", "StaticText"))
    const redeemBitcoinButton = await $(selector("Redeem Bitcoin", "Button"))
    await description.waitForDisplayed({ timeout })
    await redeemBitcoinButton.waitForDisplayed({ timeout })
    expect(description).toBeDisplayed()
    expect(redeemBitcoinButton).toBeEnabled()
  })

  it("Go back", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    // we need to wait for the back button to be displayed in the DOM again
    await browser.pause(3000)
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})

describe("Lightning Payments Flow", () => {
  let invoice: string

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Create Invoice from API", async () => {
    invoice = await getInvoice()
    expect(invoice).toContain("lntbs")
  })

  it("Paste Invoice", async () => {
    const invoiceInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
    await invoiceInput.waitForDisplayed({ timeout })
    await invoiceInput.click()
    await invoiceInput.setValue(invoice)
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Add amount", async () => {
    const amountInput = await $(selector("USD Amount", "TextField"))
    const switchButton = await $(selector("switch-button", "Other"))
    await amountInput.waitForDisplayed({ timeout })
    await amountInput.click()
    await amountInput.setValue("2")
    await switchButton.click()
  })

  it("Click Next again", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Wait for fee calculation to return", async () => {
    const feeDisplay = await $(selector("Successful Fee", "StaticText"))
    await feeDisplay.waitForDisplayed({ timeout })
  })

  it("Click 'Confirm Payment' and navigate to move money screen", async () => {
    const confirmPaymentButton = await $(
      selector(LL.SendBitcoinConfirmationScreen.title(), "Button"),
    )
    await confirmPaymentButton.waitForDisplayed({ timeout })
    await confirmPaymentButton.click()
    const currentBalanceHeader = await $(selector("Current Balance Header", "StaticText"))
    await currentBalanceHeader.waitForDisplayed({ timeout })
  })
})
