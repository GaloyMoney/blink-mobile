import "detox"
import jimp from "jimp"
import jsQR from "jsqr"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { sendLnPaymentFromBob } from "./utils/commandline"
import { setLocalAndLoginWithAccessToken, waitForHomeScreen } from "./utils/common-flows"
import { timeout, ALICE_TOKEN } from "./utils/config"
import { tap, sleep, verifyTextPresent, addAmount } from "./utils/controls"

const decodeQRCode = async (imgPath: string): Promise<string> => {
  const image = await jimp.read(imgPath)
  const { data, width, height } = image.bitmap

  const clampedArray = new Uint8ClampedArray(
    data.buffer,
    data.byteOffset,
    data.byteLength / Uint8ClampedArray.BYTES_PER_ELEMENT,
  )

  const qrCode = jsQR(clampedArray, width, height)

  if (qrCode) {
    return qrCode.data // This is the decoded text from the QR code
  }
  throw new Error("QR code could not be decoded.")
}

loadLocale("en")
const LL = i18nObject("en")

// TODO:
// Transaction list doesn't get updated in the local setup because somehow websocket
// is broken. Thereby, the received animation is not happening. This needs debugging.

// Make sure all tests in this file reset back to home screen because tests reuse same session in this file
beforeAll(async () => {
  await device.launchApp({ newInstance: true, permissions: { notifications: "YES" } })
  await setLocalAndLoginWithAccessToken(ALICE_TOKEN, LL)
})

describe("Receive: LN BTC Amountless", () => {
  it("receive ln btc amountless", async () => {
    await tap(by.id(LL.HomeScreen.receive()))

    const amountInput = element(by.id("Amount Input Button"))
    await waitFor(amountInput).toBeVisible().withTimeout(timeout)

    const readablePaymentRequest = element(by.id("readable-payment-request"))
    await waitFor(readablePaymentRequest)
      .toBeVisible()
      .withTimeout(timeout * 60)

    const qrCode = element(by.id("QR-Code"))
    await waitFor(qrCode).toBeVisible().withTimeout(timeout)
    const imgPath = await qrCode.takeScreenshot("qr-code")
    const paymentRequest = await decodeQRCode(imgPath)

    await sendLnPaymentFromBob({ paymentRequest, amount: 2 })
  })
})

describe("Receive: LN BTC $0.02 Amount", () => {
  it("receive ln btc amountless", async () => {
    await tap(by.id(LL.HomeScreen.receive()))

    const amountInput = element(by.id("Amount Input Button"))
    await waitFor(amountInput).toBeVisible().withTimeout(timeout)

    await element(by.id("receive-screen")).scroll(400, "down", NaN, 0.85)
    await addAmount("0.02", LL)

    const readablePaymentRequest = element(by.id("readable-payment-request"))
    await waitFor(readablePaymentRequest)
      .toBeVisible()
      .withTimeout(timeout * 60)

    const qrCode = element(by.id("QR-Code"))
    await waitFor(qrCode).toBeVisible().withTimeout(timeout)
    const imgPath = await qrCode.takeScreenshot("qr-code")
    const paymentRequest = await decodeQRCode(imgPath)

    await sendLnPaymentFromBob({ paymentRequest, amount: 2 })
  })
})

describe("Receive: LN Stablesats Amountless", () => {
  it("receive ln btc amountless", async () => {
    await tap(by.id(LL.HomeScreen.receive()))

    const amountInput = element(by.id("Amount Input Button"))
    await waitFor(amountInput).toBeVisible().withTimeout(timeout)

    await tap(by.id("Stablesats"))

    const readablePaymentRequest = element(by.id("readable-payment-request"))
    await waitFor(readablePaymentRequest)
      .toBeVisible()
      .withTimeout(timeout * 60)

    const qrCode = element(by.id("QR-Code"))
    await waitFor(qrCode).toBeVisible().withTimeout(timeout)
    const imgPath = await qrCode.takeScreenshot("qr-code")
    const paymentRequest = await decodeQRCode(imgPath)

    await sendLnPaymentFromBob({ paymentRequest, amount: 2 })
  })
})

describe("Receive: LN Stablesats $0.02 Amount", () => {
  it("receive ln btc amountless", async () => {
    await tap(by.id(LL.HomeScreen.receive()))

    const amountInput = element(by.id("Amount Input Button"))
    await waitFor(amountInput).toBeVisible().withTimeout(timeout)

    await tap(by.id("Stablesats"))

    await element(by.id("receive-screen")).scroll(400, "down", NaN, 0.85)
    await addAmount("0.02", LL)

    const readablePaymentRequest = element(by.id("readable-payment-request"))
    await waitFor(readablePaymentRequest)
      .toBeVisible()
      .withTimeout(timeout * 60)

    const qrCode = element(by.id("QR-Code"))
    await waitFor(qrCode).toBeVisible().withTimeout(timeout)
    const imgPath = await qrCode.takeScreenshot("qr-code")
    const paymentRequest = await decodeQRCode(imgPath)

    await sendLnPaymentFromBob({ paymentRequest, amount: 2 })
  })
})

// describe("Receive: Onchain BTC", () => {})
// describe("Receive: Onchain Stablesats", () => {})

// describe("Receive: Paycode", () => {})
