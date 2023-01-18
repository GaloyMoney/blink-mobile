import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"

describe("See transactions list", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("Click 'Transactions'", async () => {
    const transactionsButton = await $(selector(LL.common.transactions(), "Other"))
    await transactionsButton.waitForDisplayed({ timeout })
    await transactionsButton.click()
    await browser.pause(5000)
  })

  it("See transactions", async () => {
    // TODO
    // look for the "From" text
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
    await browser.pause(1000)
  })
})
