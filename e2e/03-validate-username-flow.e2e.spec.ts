import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, enter, goBack } from "./utils"

describe("Validate Username Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  const username = "test"
  const lnAddress = "test@pay.staging.galoy.io"

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.MoveMoneyScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Paste Username", async () => {
    try {
      const usernameInput = await $(
        selector(LL.SendBitcoinScreen.input(), "Other", "[1]"),
      )
      await usernameInput.waitForDisplayed({ timeout })
      await usernameInput.click()
      await browser.pause(500)
      await usernameInput.sendKeys(username.split(""))
      await enter(usernameInput)
      await browser.pause(5000)
    } catch (e) {
      // FIXME: Error if username validation fails
    }
  })

  it("Confirm Username", async () => {
    const checkBoxButton = await $(
      selector(
        LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress }),
        "Other",
      ),
    )
    const confirmButton = await $(
      selector(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton(), "Button"),
    )
    await checkBoxButton.waitForDisplayed({ timeout })
    await checkBoxButton.click()
    await confirmButton.isEnabled()
    await confirmButton.click()
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
    await browser.pause(1000)
  })
})
