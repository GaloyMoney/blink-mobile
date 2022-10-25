import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { swipe, selector } from "./utils"

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
    const getStartedButton = await $(selector(LL.GetStartedScreen.getStarted()))
    await getStartedButton.waitForDisplayed({ timeout: 30000 })
    await getStartedButton.click()
    expect(true).toBeTruthy()
  })

  it("swipes 1", async () => {
    await swipe()
    await browser.pause(600)
  })

  it("swipes 2", async () => {
    await swipe()
    await browser.pause(600)
  })

  it("swipes 3", async () => {
    await swipe()
    await browser.pause(600)
  })
})
