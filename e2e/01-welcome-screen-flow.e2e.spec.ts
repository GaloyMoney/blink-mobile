import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"
import { payTestUsername, resetLanguage } from "./utils/graphql"

describe("Welcome Screen Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  // having an invoice or bitcoin address would popup a modal
  it("Clear the clipboard", async () => {
    await browser.setClipboard("", "plaintext")
  })

  it("reset language is case previous test has failed", async () => {
    const res = await resetLanguage()
    expect(res.data.userUpdateLanguage.language).toBeFalsy()
  })

  it("Pays Test Username to Create a Contact", async () => {
    const result = await payTestUsername()
    expect(result.data?.intraLedgerPaymentSend.status).toBe("SUCCESS")
  })

  it("loads and clicks 'Get Started button'", async () => {
    const getStartedButton = await $(selector(LL.GetStartedScreen.getStarted(), "Button"))
    await getStartedButton.waitForDisplayed({ timeout })
    await getStartedButton.click()
    expect(true).toBeTruthy()
  })

  it("remove stablesats menu", async () => {
    const getStartedButton = await $(selector("Back home", "Button"))
    await getStartedButton.waitForDisplayed({ timeout })
    await getStartedButton.click()
    expect(true).toBeTruthy()
  })
})
