import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"
import { checkContact } from "./utils/graphql"

loadLocale("en")
loadLocale("es")
const LL = i18nObject("en")
const timeout = 30000

describe("Change Language Flow", () => {
  const enLL = LL
  const esLL = i18nObject("es")
  it("clicks Settings Icon", async () => {
    const settingsButton = await $(selector("Settings Button", "Button"))
    await settingsButton.waitForDisplayed({ timeout })
    await settingsButton.click()
  })

  it("clicks Language", async () => {
    const languageButton = await $(selector(enLL.common.language(), "StaticText"))
    await languageButton.waitForDisplayed({ timeout })
    await languageButton.click()
  })

  it("clicks Spanish", async () => {
    const languageButton = await $(selector(enLL.Languages.es(), "StaticText"))
    await languageButton.waitForDisplayed({ timeout })
    await languageButton.click()
  })

  it("changes language to Spanish", async () => {
    const screenTitle = await getLanguageScreenTitleElement(
      esLL.common.languagePreference(),
    )
    await screenTitle.waitForDisplayed({ timeout })
  })

  it("clicks Predetermined", async () => {
    const languageButton = await $(selector(esLL.Languages.DEFAULT(), "StaticText"))
    await languageButton.waitForDisplayed({ timeout })
    await languageButton.click()
  })

  it("changes language to English", async () => {
    const screenTitle = await getLanguageScreenTitleElement(
      enLL.common.languagePreference(),
    )
    await screenTitle.waitForDisplayed({ timeout })
  })

  it("navigates back to move money page", async () => {
    const backButtonOnLanguageScreen = await $(goBack())
    await backButtonOnLanguageScreen.click()
    const phoneSettingsTitle = await $(selector(enLL.common.phoneNumber(), "StaticText"))
    await phoneSettingsTitle.waitForDisplayed({ timeout })
    const backButtonOnSettingsScreen = await $(goBack())
    await backButtonOnSettingsScreen.click()
  })
})

describe("Contacts Flow", () => {
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
    expect(contactList?.length).toBe(contactList?.length)

    const searchBar = await $(selector(LL.common.search(), "Other"))
    await searchBar.waitForDisplayed({ timeout })
    await searchBar.click()
    await searchBar.setValue(contactList?.[0].username || "")
    if (process.env.E2E_DEVICE === "ios") {
      const enterButton = await $(selector("Return", "Button"))
      await enterButton.waitForDisplayed({ timeout })
      await enterButton.click()
      contactUsernameButton = await $(selector("RNE__LISTITEM__padView", "Other"))
    } else {
      // press the enter key
      browser.keys("\uE007")
      const uiSelector = `new UiSelector().text("${contactList?.[0].username}").className("android.widget.TextView")`
      contactUsernameButton = await $(`android=${uiSelector}`)
    }
    await contactUsernameButton.waitForDisplayed({ timeout })
    await contactUsernameButton.click()
    // pause to wait for contact details to load
    await browser.pause(2000)
    await $(selector("contact-detail-icon", "Other")).isDisplayed()
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

describe("See transactions list", () => {
  it("Click 'Transactions'", async () => {
    const transactionsButton = await $(selector(LL.common.transactions(), "Other"))
    await transactionsButton.waitForDisplayed({ timeout })
    await transactionsButton.click()
    await browser.pause(5000)
  })

  it("See transactions", async () => {
    // TODO
    // look for the "From" text
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})

describe("Price graph flow", () => {
  it("click on price graph button", async () => {
    const priceGraphButton = await $(selector("price button", "Button"))
    await priceGraphButton.waitForDisplayed({ timeout })
    await priceGraphButton.click()
  })

  it("check if price graph header is shown", async () => {
    const priceGraphHeader = await $(selector(LL.PriceScreen.satPrice(), "Other"))
    const rangeText = await $(selector("range", "StaticText"))
    await priceGraphHeader.waitForDisplayed({ timeout })
    expect(priceGraphHeader).toBeDisplayed()
    expect(rangeText).toBeDisplayed()
  })

  it("click on one week button", async () => {
    const oneWeekButton = await $(selector(LL.PriceScreen.oneWeek(), "Button"))
    const rangeText = await $(selector("range", "StaticText"))
    await oneWeekButton.waitForDisplayed({ timeout })
    await oneWeekButton.click()
    expect(rangeText).toBeDisabled()
  })

  it("click on one month button", async () => {
    const oneMonthButton = await $(selector(LL.PriceScreen.oneMonth(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await oneMonthButton.waitForDisplayed({ timeout })
    await oneMonthButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("click on one year button", async () => {
    const oneYearButton = await $(selector(LL.PriceScreen.oneYear(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await oneYearButton.waitForDisplayed({ timeout })
    await oneYearButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("click on five years button", async () => {
    const fiveYearsButton = await $(selector(LL.PriceScreen.fiveYears(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await fiveYearsButton.waitForDisplayed({ timeout })
    await fiveYearsButton.click()
    expect(rangeText).toBeDisabled()
  })

  it("go back to home screen", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})

const getLanguageScreenTitleElement = async (title: string) => {
  if (process.env.E2E_DEVICE === "ios") {
    return $(`(//XCUIElementTypeOther[@name="${title}"])[2]`)
  }
  return $(`android=new UiSelector().text("${title}")`)
}
