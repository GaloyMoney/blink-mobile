import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"
import { MUTATIONS, createGaloyServerClient } from "@galoymoney/client"

describe("Receive Payment Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  let invoice

  it("Clear the clipboard", async () => {
    await browser.setClipboard("", "plaintext")
  })

  it("Click 'Back Home' on the stablesats tutorial modal", async () => {
    try {
      const backHomeButton = await $(selector(LL.common.backHome()))
      await backHomeButton.waitForDisplayed({ timeout: 5000 })
      if (backHomeButton.isDisplayed()) {
        await backHomeButton.click()
      } else {
        expect(backHomeButton.isDisplayed()).toBeFalsy()
      }
    } catch (e) {
      expect(false).toBeFalsy()
    }
  })

  it("Click Receive", async () => {
    const receiveButton = await $(selector(LL.MoveMoneyScreen.receive(), "Other"))
    await receiveButton.waitForDisplayed({ timeout })
    await receiveButton.click()
  })

  it("Click Copy Invoice", async () => {
    let copyInvoiceButton
    if (process.env.E2E_DEVICE === "ios") {
      copyInvoiceButton = await $('(//XCUIElementTypeOther[@name="Copy Invoice"])[2]')
    } else {
      copyInvoiceButton = await $(selector("Copy Invoice"))
    }
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
    const successCheck = await $(selector("Success Icon", "Other"))
    await successCheck.waitForDisplayed({ timeout })
    expect(successCheck.isDisplayed()).toBeTruthy()
  })
})
