import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"

describe("Login Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  beforeEach(async () => {
    console.info("[beforeAll]")
  })
  afterEach(async () => {
    console.info("[afterAll] Done with testing!")
    await browser.pause(5000)
  })
  it("clicks Settings Icon", async () => {
    const settingsButton = await $(selector("Settings Button"))
    await settingsButton.waitForDisplayed({ timeout })
    await settingsButton.click()
  })

  it("taps Build version 3 times", async () => {
    const buildButton = await $(selector("Version Build Text", "StaticText"))
    await buildButton.waitForDisplayed({ timeout })
    await buildButton.click()
    await buildButton.click()
    await buildButton.click()
  })

  it("click staging environment", async () => {
    await browser.pause(1000)
    const instanceButton = await $(selector("Galoy Instance Button", "Other"))
    await instanceButton.waitForDisplayed({ timeout })
    const { x, y } = await instanceButton.getLocation()
    const { width, height } = await instanceButton.getSize()
    // calc the midpoint center because we want to click the second button - in the middle
    const midpointX = width / 2 + x
    const midpointY = height / 2 + y
    await browser.touchAction({ action: "tap", x: midpointX, y: midpointY })
  })

  it("input token", async () => {
    const tokenInput = await $(selector("Input access token", "TextField"))
    await tokenInput.click()
    await tokenInput.sendKeys(process.env.GALOY_TOKEN?.split(""))
    await tokenInput.sendKeys(["\n"])
  })

  it("click change token", async () => {
    await browser.pause(1000)
    const changeTokenButton = await $(selector("Change Token Button"))
    await changeTokenButton.waitForDisplayed({ timeout })
    await changeTokenButton.click()
  })

  it("click go back to settings screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
  })

  it("click go back to home screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
  })
})
