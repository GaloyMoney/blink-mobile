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
    const { contactList } = await checkContact()
    let contactUsernameButton: WebdriverIO.Element
    if (contactList && contactList?.length > 0) {
      expect(contactList).toBeElementsArrayOfSize(contactList?.length)
      const searchBar = await $(selector(LL.common.search(), "Other"))
      await searchBar.waitForDisplayed({ timeout: 5000 })
      await searchBar.click()
      await searchBar.setValue(contactList[0].username)
      if (process.env.E2E_DEVICE === "ios") {
        const enterButton = await $(selector("Return", "Button"))
        await enterButton.waitForDisplayed({ timeout: 5000 })
        await enterButton.click()
        contactUsernameButton = await $(selector("RNE__LISTITEM__padView", "Other"))
      } else {
        // press the enter key
        browser.keys("\uE007")
        const uiSelector = `new UiSelector().text("${contactList[0].username}").className("android.widget.TextView")`
        contactUsernameButton = await $(`android=${uiSelector}`)
      }
      await contactUsernameButton.waitForDisplayed({ timeout: 5000 })
      await contactUsernameButton.click()
      // pause to wait for contact details to load
      browser.pause(6000)
      await $(selector("contact-detail-icon", "Other")).isDisplayed()
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
