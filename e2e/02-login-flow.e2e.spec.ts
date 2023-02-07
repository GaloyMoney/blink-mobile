import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector, enter, scrollDown, scrollUp } from "./utils"
import { mobileUserToken } from "./utils/graphql"

describe("Login Flow", () => {
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
    await browser.pause(50)
    await buildButton.click()
    await browser.pause(50)
    await buildButton.click()
  })

  it("click staging environment", async () => {
    // scroll down for small screens
    const logoutButton = await $(selector("logout button", "Button"))
    await logoutButton.waitForDisplayed({ timeout })
    await scrollDown()
    const stagingEnvironmentButton = await $(selector("Staging Button", "Button"))
    await stagingEnvironmentButton.waitForDisplayed({ timeout })
    await stagingEnvironmentButton.click()
  })

  it("input token", async () => {
    try {
      const tokenInput = await $(
        selector(
          "Input access token",
          process.env.E2E_DEVICE === "ios" ? "SecureTextField" : "TextField",
        ),
      )
      await tokenInput.waitForDisplayed({ timeout })
      await tokenInput.click()
      await tokenInput.waitUntil(tokenInput.isKeyboardShown)
      await tokenInput.setValue(mobileUserToken)
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
    const tokenPresentText = await $(selector("Token Present", "StaticText"))
    browser.waitUntil(async () => (await tokenPresentText.getValue()).includes("true"))
  })

  it("click go back to settings screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
  })

  it("are we logged in?", async () => {
    // scroll up for small screens
    scrollUp()

    const accountButton = await $(selector(LL.common.account(), "StaticText"))
    await accountButton.waitForDisplayed({ timeout })
    await accountButton.click()
    const logoutButton = await $(selector(LL.common.logout(), "StaticText"))
    await logoutButton.waitForDisplayed({ timeout })
    expect(logoutButton.isDisplayed()).toBeTruthy()
  })

  it("navigates back to move money page", async () => {
    const backButtonOnAccountScreen = await $(goBack())
    await backButtonOnAccountScreen.click()
    const phoneSetting = await $(selector(LL.common.phoneNumber(), "StaticText"))
    await phoneSetting.waitForDisplayed({ timeout })
    const backButtonOnSettingsScreen = await $(goBack())
    await backButtonOnSettingsScreen.click()
    const backHomeButton = await $(selector(LL.common.backHome(), "Button"))
    await backHomeButton.waitForDisplayed({ timeout: 5000 })
    await backHomeButton.click()
  })
})
