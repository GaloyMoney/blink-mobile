import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector, enter } from "./utils"
import { MUTATIONS, createGaloyServerClient } from "@galoymoney/client"

describe("Receive Payment Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  let invoice
  beforeEach(async () => {
    console.info("[beforeAll]")
  })
  afterEach(async () => {
    console.info("[afterAll] Done with testing!")
    await browser.pause(5000)
  })

  it("Clear the clipboard", async () => {
    await browser.setClipboard("", "plaintext")
  })

  it("Click 'Back Home' on the stablesats tutorial modal", async () => {
    const backHomeButton = await $(selector(LL.common.backHome()))
    await backHomeButton.waitForDisplayed({ timeout: 2000 })
    if (backHomeButton.isDisplayed()) {
      await backHomeButton.click()
    }
  })

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.MoveMoneyScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("Click Copy Invoice", async () => {
    // selector(LL.ReceiveBitcoinScreen.copyInvoice(), "Other", "[2]"),
    const copyInvoiceButton = await $('(//XCUIElementTypeOther[@name="Copy Invoice"])[2]')
    await copyInvoiceButton.waitForDisplayed({ timeout })
    await copyInvoiceButton.click()
  })

  it("Get Invoice from clipboard", async () => {
    await browser.pause(800)
    const invoiceBase64 = await browser.getClipboard()
    invoice = new Buffer(invoiceBase64, "base64").toString()
  })

  it("External User Pays the Invoice", async () => {
    const authToken = process.env.GALOY_TOKEN_2
    const config = {
      network: "signet",
      graphqlUrl: "https://api.staging.galoy.io/graphql",
    }
    const client = createGaloyServerClient({ config })({ authToken })
    const result = await client.mutate({
      variables: {
        input: {
          walletId: "8914b38f-b0ea-4639-9f01-99c03125eea5", // wallet 2
          paymentRequest: invoice,
          amount: 5,
        },
      }, // TODO (lookup wallet id from graphql)
      mutation: MUTATIONS.lnNoAmountInvoicePaymentSend,
      fetchPolicy: "no-cache",
    })
    const payResult = result
    expect(payResult).toBeTruthy()
  })

  it("Wait for Green check", async () => {
    const successCheck = await $(selector(LL.SendBitcoinScreen.success(), "StaticText"))
    await successCheck.waitForDisplayed()
  })
})
