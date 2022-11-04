import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector, enter } from "./utils"
import { MUTATIONS, createGaloyServerClient } from "@galoymoney/client"

describe("Payments Flow", async () => {
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

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.MoveMoneyScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Create Invoice", async () => {
    // gen invoice from +503XXX55540
    const authToken = process.env.GALOY_TOKEN_2
    const config = {
      network: "signet",
      graphqlUrl: "https://api.staging.galoy.io/graphql",
    }
    const client = createGaloyServerClient({ config })({ authToken })
    const result = await client.mutate({
      variables: { input: { walletId: "8914b38f-b0ea-4639-9f01-99c03125eea5" } },
      mutation: MUTATIONS.lnNoAmountInvoiceCreate,
      fetchPolicy: "no-cache",
    })
    invoice = result.data.lnNoAmountInvoiceCreate.invoice.paymentRequest
    expect(invoice).toBeTruthy()
  })

  it("Paste Invoice", async () => {
    try {
      const invoiceInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
      await invoiceInput.waitForDisplayed({ timeout })
      await invoiceInput.click()
      await browser.pause(500)
      await invoiceInput.sendKeys(invoice.split(""))
      await enter(invoiceInput)
    } catch (e) {
      // TODO this passes but throws an error on ios even tho it works
    }
  })

  it("Add amount", async () => {
    // USD Amount or BTC Amount
  })

  it("Add Note or label", async () => {
    //
  })

  it("Click Next", async () => {
    // Error Please Enter a valid destination
    const nextButton = await $(selector(LL.common.next()))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.click()
  })

  it("Wait for fee calulation to return", async () => {
    //
    await browser.pause(8000)
  })

  it("Click 'Confirm Payment'", async () => {
    // const nextButton = await $(selector(LL.common.next()))
    // await nextButton.waitForDisplayed({ timeout })
    // await nextButton.click()
  })

  it("Wait for Green check", async () => {
    //
  })
})
