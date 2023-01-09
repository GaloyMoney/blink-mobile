import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"

describe("See transactions list", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("Click 'Transactions'", async () => {
    const backHomeButton = await $(selector(LL.common.transactions()))
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()

    await browser.pause(10000)
  })

  it("See transactions", async () => {
    // TODO
    // look for the "From" text
  })

})
