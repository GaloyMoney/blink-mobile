import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"

describe("Welcome Screen Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("loads and clicks 'Get Started button' ", async () => {
    const getStartedButton = await $(selector(LL.GetStartedScreen.getStarted()))
    await getStartedButton.waitForDisplayed({ timeout })
    await getStartedButton.click()
    expect(true).toBeTruthy()
  })
})
