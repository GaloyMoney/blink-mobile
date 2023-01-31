import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"
import { checkContact } from "./utils/graphql"

describe("Contacts Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("Click Contacts Button", async () => {
    let contactButton: WebdriverIO.Element
    if (process.env.E2E_DEVICE === "ios") {
      contactButton = await $(selector("Contacts, tab, 2 of 4", "Button"))
    } else {
      const select =
        'new UiSelector().text("Contacts").className("android.widget.TextView")'
      contactButton = await $(`android=${select}`)
    }
    await contactButton.waitForDisplayed({ timeout })
    await contactButton.click()
  })

  it("Check if contacts exists", async () => {
    const contacts = (await checkContact()).contactList
    if (contacts && contacts?.length > 0) {
      expect(contacts).toBeElementsArrayOfSize(contacts?.length)
      const searchBar = await $(selector(LL.common.search(), "Other"))
      await searchBar.waitForDisplayed({ timeout: 5000 })
    } else {
      const noContactTitle = await $(
        selector(LL.ContactsScreen.noContactsTitle(), "Static Text"),
      )
      await noContactTitle.waitForDisplayed({ timeout: 5000 })
    }
  })

  it("Go back to main screen", async () => {
    let homeButton: WebdriverIO.Element
    if (process.env.E2E_DEVICE === "ios") {
      homeButton = await $(selector("Home, tab, 1 of 4", "Button"))
    } else {
      const select = 'new UiSelector().text("Home").className("android.widget.TextView")'
      homeButton = await $(`android=${select}`)
    }
    await homeButton.waitForDisplayed({ timeout })
    await homeButton.click()
    await browser.pause(2000)
  })
})
