import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  clickBackButton,
  clickIcon,
  clickOnSetting,
  waitTillSettingDisplayed,
  userToken,
  selector,
  scrollDown,
  scrollUp,
  clickButton,
  waitTillTextDisplayed,
  waitTillButtonDisplayed,
  getInbox,
  getFirstEmail,
  getSecondEmail,
  clickAlertLastButton,
  sleep,
} from "./utils"

describe("Login Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  let email = ""
  let inboxId = ""

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
    if (process.env.E2E_DEVICE !== "ios") await clickIcon("close")

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

    const inboxRes = await getInbox()
    if (!inboxRes) throw new Error("No inbox response")
    inboxId = inboxRes.id
    email = inboxRes.emailAddress

    const emailInput = await $(
      selector(LL.EmailRegistrationInitiateScreen.placeholder(), "Other", "[1]"),
    )

    await emailInput.waitForDisplayed({ timeout })
    await emailInput.click()
    await emailInput.setValue(email)
    await clickButton(LL.EmailRegistrationInitiateScreen.send())
  })

  it("verifying email", async () => {
    const emailRes = await getFirstEmail(inboxId)
    if (!emailRes) throw new Error("No email response")

    const { subject, body } = emailRes
    expect(subject).toEqual("your code")

    const regex = /\b\d{6}\b/
    const match = body.match(regex)
    if (!match) throw new Error("No code found in email body")
    const code = match[0]

    const placeholder = "000000"
    const codeInput = await $(selector(placeholder, "Other", "[1]"))
    await codeInput.waitForDisplayed({ timeout })
    await codeInput.click()
    await codeInput.setValue(code)

    clickAlertLastButton(LL.common.ok())
  })

  it("log out", async () => {
    await clickOnSetting(LL.AccountScreen.logOutAndDeleteLocalData())

    clickAlertLastButton(LL.AccountScreen.IUnderstand())
    await sleep(250)
    clickAlertLastButton(LL.common.ok())
  })

  it("set staging environment again", async () => {
    if (process.env.E2E_DEVICE !== "ios") await clickIcon("close")

    const buildButton = await $(selector("logo-button", "Other"))
    await buildButton.waitForDisplayed({ timeout })
    await buildButton.click()
    await browser.pause(100)
    await buildButton.click()
    await browser.pause(100)
    await buildButton.click()
    await browser.pause(100)

    // scroll down for small screens
    await waitTillButtonDisplayed("logout button")
    await scrollDown()
    await clickButton("Staging Button")
    await clickButton("Save Changes")

    await clickBackButton()
  })

  it("log back in", async () => {
    const emailLink = await $(selector("email-button", "Other"))
    await emailLink.waitForDisplayed({ timeout })
    await emailLink.click()

    const emailInput = await $(
      selector(LL.EmailRegistrationInitiateScreen.placeholder(), "Other", "[1]"),
    )
    await emailInput.waitForDisplayed({ timeout })
    await emailInput.click()
    await emailInput.setValue(email)
    await clickButton(LL.EmailRegistrationInitiateScreen.send())

    const emailRes = await getSecondEmail(inboxId)
    if (!emailRes) throw new Error("No email response")

    const { subject, body } = emailRes
    expect(subject).toEqual("your code")

    const regex = /\b\d{6}\b/
    const match = body.match(regex)
    if (!match) throw new Error("No code found in email body")
    const code = match[0]

    const placeholder = "000000"
    const codeInput = await $(selector(placeholder, "Other", "[1]"))
    await codeInput.waitForDisplayed({ timeout })
    await codeInput.click()
    await codeInput.setValue(code)

    await clickIcon("close")
  })
})
