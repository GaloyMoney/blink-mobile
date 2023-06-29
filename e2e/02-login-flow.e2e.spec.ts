import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  clickBackButton,
  clickIcon,
  clickOnSetting,
  waitTillOnHomeScreen,
  waitTillSettingDisplayed,
  userToken,
  selector,
  scrollDown,
  scrollUp,
} from "./utils"

describe("Login Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("clicks Settings Icon", async () => {
    await clickIcon("menu")
  })

  it("taps Build version 3 times", async () => {
    // scroll down for small screens
    await waitTillSettingDisplayed(LL.GetStartedScreen.logInCreateAccount())
    await scrollDown()

    const buildButton = await $(selector("Version Build Text", "StaticText"))
    await buildButton.waitForDisplayed({ timeout })
    await buildButton.click()
    await browser.pause(100)
    await buildButton.click()
    await browser.pause(100)
    await buildButton.click()
    await browser.pause(100)
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
    const tokenInput = await $(
      selector(
        "Input access token",
        process.env.E2E_DEVICE === "ios" ? "SecureTextField" : "TextField",
      ),
    )
    await tokenInput.waitForDisplayed({ timeout })
    await tokenInput.click()
    await tokenInput.waitUntil(tokenInput.isKeyboardShown)
    await tokenInput.setValue(userToken)
    if (process.env.E2E_DEVICE === "ios") {
      const enterButton = await $(selector("Return", "Button"))
      await enterButton.waitForDisplayed({ timeout })
      await enterButton.click()
    } else {
      // press the enter key
      browser.keys("\uE007")
    }
  })

  it("click Save Changes", async () => {
    let tokenPresent: WebdriverIO.Element
    const changeTokenButton = await $(selector("Save Changes", "Button"))
    await changeTokenButton.waitForDisplayed({ timeout })
    await changeTokenButton.click()
    if (process.env.E2E_DEVICE === "ios") {
      tokenPresent = await $(selector("Token Present: true", "StaticText"))
    } else {
      const select = `new UiSelector().text("Token Present: true").className("android.widget.TextView")`
      tokenPresent = await $(`android=${select}`)
    }
    const tokenPresentText = await tokenPresent.getText()
    expect(tokenPresentText.includes("true")).toBeTruthy()
  })

  it("click go back to settings screen", async () => {
    await clickBackButton()
  })

  it("are we logged in?", async () => {
    // scroll up for small screens
    const buildButton = await $(selector("Version Build Text", "StaticText"))
    await buildButton.waitForDisplayed({ timeout })
    await scrollUp()

    await clickOnSetting(LL.common.account())
    await waitTillSettingDisplayed(LL.common.transactionLimits())
    await clickBackButton()
    await waitTillSettingDisplayed(LL.common.account())
  })

  it("navigates back to move home screen", async () => {
    await clickBackButton()
    await waitTillOnHomeScreen()
  })
})
