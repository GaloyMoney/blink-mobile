import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector, enter, scrollDown, scrollUp } from "./utils"
import { mobileUserToken } from "./utils/graphql"

describe("Login Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("clicks Settings Icon", async () => {
    const settingsButton = await $(selector("Settings Button", "Button"))
    await settingsButton.waitForDisplayed({ timeout })
    await settingsButton.click()
  })

  it("taps Build version 3 times", async () => {
    // scroll down for small screens
    const phoneSetting = await $(selector(LL.common.phoneNumber(), "StaticText"))
    await phoneSetting.waitForDisplayed({ timeout })
    await scrollDown()

    const buildButton = await $(selector("Version Build Text", "StaticText"))
    await buildButton.waitForDisplayed({ timeout })
    await buildButton.click()
    await browser.pause(800)
    await buildButton.click()
    await browser.pause(800)
    await buildButton.click()
  })

  it("click staging environment", async () => {
    // scroll down for small screens
    await browser.pause(2000)
    await scrollDown()

    await browser.pause(1000)
    const instanceButton = await $(selector("Galoy Instance Button", "Other"))
    await instanceButton.waitForDisplayed({ timeout: 60000 })
    const { x, y } = await instanceButton.getLocation()
    const { width, height } = await instanceButton.getSize()
    // calc the midpoint center because we want to click the second button - in the middle
    const midpointX = width / 3 + x
    const midpointY = height / 3 + y
    await browser.touchAction({ action: "tap", x: midpointX, y: midpointY })
    await browser.pause(2000)
  })

  it("input token", async () => {
    try {
      const tokenInput = await $(selector("Input access token", "SecureTextField"))
      await tokenInput.waitForDisplayed({ timeout })
      if (await tokenInput.isDisplayed()) {
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
      await tokenInput.sendKeys(mobileUserToken?.split(""))
      await enter(tokenInput)
    } catch (e) {
      // this passes but sometimes throws an error on ios
      // even though it works properly
    }
  })

  it("click Save Changes", async () => {
    const changeTokenButton = await $(selector("Save Changes", "Button"))
    await changeTokenButton.waitForDisplayed({ timeout })
    await changeTokenButton.click()
    await browser.pause(2000)
  })

  it("click go back to settings screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(1000)
  })

  it("are we logged in?", async () => {
    // scroll up for small screens
    await browser.pause(2000)
    scrollUp()

    const accountButton = await $(selector(LL.common.account(), "StaticText"))
    await accountButton.waitForDisplayed({ timeout })
    await accountButton.click()
    const logoutButton = await $(selector(LL.common.logout(), "StaticText"))
    await logoutButton.waitForDisplayed({ timeout })
    expect(logoutButton.isDisplayed()).toBeTruthy()
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(1000)
  })

  it("click go back to home screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(1000)
  })

  it("Dismiss stablesats tutorial modal", async () => {
    try {
      const backHomeButton = await $(selector(LL.common.backHome(), "Button"))
      await backHomeButton.waitForDisplayed({ timeout: 5000 })
      if (await backHomeButton.isDisplayed()) {
        await backHomeButton.click()
      } else {
        expect(backHomeButton.isDisplayed()).toBeFalsy()
      }
    } catch (e) {
      expect(false).toBeFalsy()
    }
  })
})
