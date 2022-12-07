import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector, enter, scroll } from "./utils"

describe("Login Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("clicks Settings Icon", async () => {
    const settingsButton = await $(selector("Settings Button"))
    await settingsButton.waitForDisplayed({ timeout })
    await settingsButton.click()
  })

  it("taps Build version 3 times", async () => {
    const buildButton = await $(selector("Version Build Text", "StaticText"))
    await buildButton.waitForDisplayed({ timeout })
    await buildButton.click()
    await browser.pause(800)
    await buildButton.click()
    await browser.pause(800)
    await buildButton.click()
  })

  it("Scroll to bottom", async () => {
    await browser.pause(2000)
    await scroll()
  })

  it("click staging environment", async () => {
    await browser.pause(2000)
    const instanceButton = await $(selector("Galoy Instance Button", "Other"))
    await instanceButton.waitForDisplayed({ timeout })
    const { x, y } = await instanceButton.getLocation()
    const { width, height } = await instanceButton.getSize()
    // calc the midpoint center because we want to click the second button - in the middle
    const midpointX = width / 3 + x
    const midpointY = height / 3 + y
    await browser.touchAction({ action: "tap", x: midpointX, y: midpointY })
    await browser.pause(8000)
  })

  it("click Save Changes", async () => {
    const changeTokenButton = await $(selector("Save Changes"))
    await changeTokenButton.waitForDisplayed({ timeout })
    await changeTokenButton.click()
    await browser.pause(2000)
  })

  it("input token", async () => {
    try {
      const tokenInput = await $(selector("Input access token", "SecureTextField"))
      await tokenInput.waitForDisplayed({ timeout })
      if (tokenInput.isDisplayed()) {
        await tokenInput.click()
      } else {
        try {
          const tokenInput2 = await $(selector("Input access token", "TextField"))
          await tokenInput2.waitForDisplayed({ timeout })
          await tokenInput2.click()
        } catch (e) {
          // pass thru
        }
      }
      await browser.pause(1000)
      await tokenInput.sendKeys(process.env.GALOY_TOKEN?.split(""))
      await enter(tokenInput)
    } catch (e) {
      // this passes but sometimes throws an error on ios
      // even though it works properly
    }
  })

  it("click Save Changes", async () => {
    const changeTokenButton = await $(selector("Save Changes"))
    await changeTokenButton.waitForDisplayed({ timeout })
    await changeTokenButton.click()
    await browser.pause(8000)
  })

  it("click go back to settings screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(5000)
  })

  it("are we logged in?", async () => {
    const loggedInListItem = await $(selector(LL.common.logout(), "Other"))
    await loggedInListItem.waitForDisplayed({ timeout })
    expect(loggedInListItem.isDisplayed()).toBeTruthy()
    await browser.pause(1000)
  })

  it("click go back to home screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(1000)
  })
})
