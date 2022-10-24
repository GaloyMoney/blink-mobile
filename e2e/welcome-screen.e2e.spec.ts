import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"

describe("Welcome Screen", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  beforeEach(async () => {
    console.info("[beforeAll]")
  })
  afterEach(async () => {
    console.info("[afterAll] Done with testing!")
  })
  it("loads and clicks 'Get Started button' ", async () => {
    const getStartedButton = await $(`~${LL.GetStartedScreen.getStarted()}`)
    await getStartedButton.waitForDisplayed({ timeout: 30000 })
    if (getStartedButton) await getStartedButton.click()
    await driver.pause(3000)
    expect(true).toBeTruthy()
  })
})
