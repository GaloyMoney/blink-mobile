import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  clickButton,
  clickIcon,
  payTestUsername,
  resetDisplayCurrency,
  resetEmail,
  resetLanguage,
} from "./utils"

describe("Welcome Screen Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")

  // having an invoice or bitcoin address would popup a modal
  it("Clear the clipboard", async () => {
    await browser.setClipboard("", "plaintext")
  })

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

  it("loads and clicks 'Explore wallet instead'", async () => {
    await clickButton(LL.GetStartedScreen.exploreWallet())

    await clickIcon("close")
  })
})
