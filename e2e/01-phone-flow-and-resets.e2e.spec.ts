import { TranslationFunctions } from "@app/i18n/i18n-types"
import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  clickAlertLastButton,
  clickBackButton,
  clickButton,
  clickIcon,
  otp,
  payTestUsername,
  phoneNumber,
  resetDisplayCurrency,
  resetEmail,
  resetLanguage,
  scrollDown,
  selector,
  setUserToken,
  timeout,
  waitTillButtonDisplayed,
  waitTillOnHomeScreen,
  waitTillSettingDisplayed,
  waitTillTextDisplayed,
} from "./utils"

export const getAccessTokenFromClipboard = async (LL: TranslationFunctions) => {
  await clickIcon("menu")
  await waitTillSettingDisplayed(LL.common.account())

  await scrollDown()

  const buildButton = await $(selector("Version Build Text", "StaticText"))
  await buildButton.waitForDisplayed({ timeout })
  await buildButton.click()
  await browser.pause(100)
  await buildButton.click()
  await browser.pause(100)
  await buildButton.click()
  await browser.pause(100)

  await scrollDown()
  await browser.pause(200)
  await scrollDown()

  let token = ""

  if (process.env.E2E_DEVICE === "ios") {
    // on ios, get invoice from share link because copy does not
    // work on physical device for security reasons
    await clickButton("Share access token")

    const accessTokenSharedScreen = await $('//*[contains(@name,"ory_st")]')
    await accessTokenSharedScreen.waitForDisplayed({
      timeout: 8000,
    })
    token = await accessTokenSharedScreen.getAttribute("name")
    await clickButton("Close")
  } else {
    // get from clipboard in android
    await clickButton("Copy access token")
    await browser.pause(200)
    const tokenBase64 = await browser.getClipboard()
    token = Buffer.from(tokenBase64, "base64").toString()
  }

  expect(token).not.toBe("")
  setUserToken(token)

  if (process.env.E2E_DEVICE === "android") {
    await browser.pause(100)
    await clickAlertLastButton(LL.common.ok())
    await browser.pause(100)
  }

  await clickBackButton()
  await browser.pause(100)
  await clickBackButton()
}

describe("Login with Phone Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  // having an invoice or bitcoin address would popup a modal
  it("Clear the clipboard", async () => {
    await browser.setClipboard("", "plaintext")
  })

  it("Set staging environment", async () => {
    // triple tap icon
    const buildButton = await $(selector("logo-button", "Other"))
    await buildButton.waitForDisplayed({ timeout })
    await buildButton.click()
    await browser.pause(100)
    await buildButton.click()
    await browser.pause(100)
    await buildButton.click()
    await browser.pause(100)

    await waitTillButtonDisplayed("logout button")
    await scrollDown()
    await clickButton("Staging Button")
    await clickButton("Save Changes")

    await waitTillTextDisplayed("Galoy Instance: Staging")
    await clickBackButton()
  })

  it("Login as an user", async () => {
    await clickButton(LL.GetStartedScreen.createAccount())

    const telephoneInput = await $(selector("telephoneNumber", "Other", "[1]"))
    await telephoneInput.waitForDisplayed({ timeout })
    await telephoneInput.click()
    await telephoneInput.setValue(phoneNumber)

    await browser.pause(500)

    await clickButton(LL.PhoneLoginInitiateScreen.sms())

    const otpInput = await $(selector("oneTimeCode", "Other", "[1]"))
    await otpInput.waitForDisplayed({ timeout })
    await otpInput.click()
    await otpInput.setValue(String(otp))

    await waitTillOnHomeScreen()
  })

  it("Get the access token from clipboard", async () => {
    await getAccessTokenFromClipboard(LL)
  })
})

describe("Resets", () => {
  it("reset language in case previous test has failed", async () => {
    const result = await resetLanguage()
    expect(result).toBeTruthy()
    expect(result.data?.userUpdateLanguage.user?.language).toBeFalsy()
  })

  it("reset email in case previous test has failed", async () => {
    const result = await resetEmail()
    expect(result).toBeTruthy()
    expect(result.data?.userEmailDelete.me?.email?.address).toBeFalsy()
    expect(result.data?.userEmailDelete.me?.email?.verified).toBeFalsy()
  })

  it("Pays Test Username to Create a Contact", async () => {
    const result = await payTestUsername()
    expect(result.data?.intraLedgerPaymentSend.status).toBe("SUCCESS")
  })

  it("resets display currency to USD", async () => {
    const result = await resetDisplayCurrency()
    expect(result.data?.accountUpdateDisplayCurrency.account?.displayCurrency).toBe("USD")
  })
})
