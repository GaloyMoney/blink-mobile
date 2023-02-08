import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, enter, goBack } from "./utils"
import { checkContact } from "./utils/graphql"

describe("Validate Username Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  const username = "extheo"
  const lnAddress = "extheo@pay.staging.galoy.io"

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
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
      await usernameInput.setValue(username)
      await enter(usernameInput)
    } catch (err) {
      console.error(err)
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
    const { isContactAvailable } = await checkContact(username)
    if (!isContactAvailable) {
      if ((await checkBoxButton.isDisplayed()) || (await confirmButton.isEnabled())) {
        await checkBoxButton.click()
        await confirmButton.isEnabled()
        await confirmButton.click()
      }
    }
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})
