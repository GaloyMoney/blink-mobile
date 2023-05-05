import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"
import { payTestUsername, resetDisplayCurrency, resetLanguage } from "./utils/graphql"

describe("Welcome Screen Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  // having an invoice or bitcoin address would popup a modal
  it("Clear the clipboard", async () => {
    await browser.setClipboard("", "plaintext")
  })

  it("reset language in case previous test has failed", async () => {
    const result = await resetLanguage()
    expect(result).toBeTruthy()
    expect(result.data?.userUpdateLanguage.user?.language).toBeFalsy()
  })

  it("Pays Test Username to Create a Contact", async () => {
    const result = await payTestUsername()
    expect(result.data?.intraLedgerPaymentSend.status).toBe("SUCCESS")
    expect(result).toBeTruthy()
  })

  it("resets display currency to USD", async () => {
    const result = await resetDisplayCurrency()
    expect(result).toBeTruthy()
    expect(result.data?.accountUpdateDisplayCurrency.account?.displayCurrency).toBe("USD")
  })

  it("loads and clicks 'Get Started button'", async () => {
    const getStartedButton = await $(
      selector(LL.GetStartedScreen.exploreWalletInstead(), "Button"),
    )
    await getStartedButton.waitForDisplayed({ timeout })
    await getStartedButton.click()
  })
})
