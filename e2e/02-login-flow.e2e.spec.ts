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
  clickButton,
  waitTillTextDisplayed,
  waitTillButtonDisplayed,
} from "./utils"

function createRandomHandle() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const charactersLength = characters.length
  const randomPart = Array.from({ length: 8 })
    .map(() => characters.charAt(Math.floor(Math.random() * charactersLength)))
    .join("")
  return `galoy-${randomPart}`
}

describe("Login Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  const emailHandle = createRandomHandle()

  it("clicks Settings Icon", async () => {
    await clickIcon("menu")
  })

  it("taps Build version 3 times", async () => {
    // scroll down for small screens
    await waitTillSettingDisplayed(LL.SettingsScreen.logInOrCreateAccount())
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
    await waitTillButtonDisplayed("logout button")
    await scrollDown()
    await clickButton("Staging Button")
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
    await clickButton("Save Changes")
    await waitTillTextDisplayed("Token Present: true")
  })

  it("click go back to settings screen", async () => {
    await clickBackButton()
  })

  it("are we logged in?", async () => {
    // scroll up for small screens
    await scrollUp()
    await scrollUp()

    await clickOnSetting(LL.common.account())
    await waitTillSettingDisplayed(LL.common.transactionLimits())
  })

  it("adding an email", async () => {
    await clickOnSetting(LL.AccountScreen.emailAuthentication())

    const email = `${emailHandle}@mailinator.com`

    const emailInput = await $(
      selector(LL.EmailRegistrationInitiateScreen.placeholder(), "Other", "[1]"),
    )
    await emailInput.waitForDisplayed({ timeout })
    await emailInput.click()
    await emailInput.setValue(email)
    await clickButton(LL.EmailRegistrationInitiateScreen.send())
  })

  it("verifying email", async () => {
    // TODO
    // const code = "123456"
    await clickBackButton()
    await clickBackButton()
  })

  it("navigates back to move home screen", async () => {
    await clickBackButton()
    await waitTillSettingDisplayed(LL.common.account())

    await clickBackButton()
    await waitTillOnHomeScreen()
  })
})
