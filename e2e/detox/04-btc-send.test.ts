import "detox"

import { ALICE_PHONE, timeout } from "./utils/config"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

import { setLocalAndLoginAs, waitForHomeScreen } from "./utils/common-flows"
import { getExternalLNNoAmountInvoice, getOnchainAddress } from "./utils/commandline"
import {
  addLargeAmount,
  addSmallAmount,
  sleep,
  slideSlider,
  tap,
  verifyTextPresent,
} from "./utils/controls"

loadLocale("en")
const LL = i18nObject("en")

describe("BTC Send Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
    await setLocalAndLoginAs(ALICE_PHONE, LL)()
  })

  afterAll(async () => {
    await device.terminateApp()
  })

  it("send payment to external invoice", async () => {
    await tap(by.id(LL.HomeScreen.send()))

    const invoice = await getExternalLNNoAmountInvoice()

    const invoiceInput = element(by.id(LL.SendBitcoinScreen.placeholder()))
    await waitFor(invoiceInput).toBeVisible().withTimeout(timeout)
    await invoiceInput.clearText()
    await invoiceInput.typeText(invoice)
    await tap(by.id(LL.common.next()))

    await addSmallAmount(LL)
    await tap(by.id(LL.common.next()))

    await waitFor(element(by.id("Successful Fee")))
      .toBeVisible()
      .withTimeout(timeout * 20)

    await slideSlider()
    await sleep(3000)
  })

  it("check if latest transaction has been updated for external invoice", async () => {
    await tap(by.id(LL.common.back()))
    await waitForHomeScreen(LL)

    const tx = element(by.text(`Invoice`))
    await waitFor(tx).toBeVisible().withTimeout(timeout)

    await tx.tap()
    await verifyTextPresent(LL.TransactionDetailScreen.spent())

    // TODO: Verify Payment Request

    await tap(by.id("close"))
    await waitForHomeScreen(LL)
  })

  it("send payment to onchain address", async () => {
    await tap(by.id(LL.HomeScreen.send()))

    const address = await getOnchainAddress()

    const addressInput = element(by.id(LL.SendBitcoinScreen.placeholder()))
    await waitFor(addressInput).toBeVisible().withTimeout(timeout)
    await addressInput.clearText()
    await addressInput.typeText(address)
    await tap(by.id(LL.common.next()))

    await addLargeAmount(LL)
    await tap(by.id(LL.common.next()))

    await waitFor(element(by.id("Successful Fee")))
      .toBeVisible()
      .withTimeout(timeout * 20)

    await slideSlider()
    await sleep(3000)
  })

  it("check if latest transaction has been updated for onchain address", async () => {
    await tap(by.id(LL.common.back()))
    await waitForHomeScreen(LL)

    const tx = element(by.text(`Invoice`))
    await waitFor(tx).toBeVisible().withTimeout(timeout)

    await tx.tap()
    await verifyTextPresent(LL.TransactionDetailScreen.spent())

    // TODO: Verify Address

    await tap(by.id("close"))
    await waitForHomeScreen(LL)
  })
})
