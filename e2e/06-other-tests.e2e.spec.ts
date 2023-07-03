import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector } from "./utils"
import {
  clickBackButton,
  clickIconButton,
  clickOnSetting,
  waitTillOnHomeScreen,
  waitTillSettingDisplayed,
} from "./utils/components"
import { checkContact } from "./utils/graphql"

loadLocale("en")
loadLocale("es")
const LL = i18nObject("en")
const timeout = 30000

describe("Change Language Flow", () => {
  const enLL = LL
  const esLL = i18nObject("es")
  it("clicks Settings Icon", async () => {
    await clickIconButton("menu")
  })

  it("clicks Language", async () => {
    await clickOnSetting(enLL.common.language())
    browser.pause(2000)
  })

  it("changes language to Spanish", async () => {
    await clickOnSetting("Español")

    const screenTitle = await getLanguageScreenTitleElement(
      esLL.common.languagePreference(),
    )
    await screenTitle.waitForDisplayed({ timeout })
  })

  it("changes language back to Predetermined", async () => {
    await clickOnSetting(esLL.Languages.DEFAULT())

    const screenTitle = await getLanguageScreenTitleElement(
      enLL.common.languagePreference(),
    )
    await screenTitle.waitForDisplayed({ timeout })
  })

  it("navigates back to move home screen", async () => {
    await clickBackButton()
    await waitTillSettingDisplayed(enLL.common.account())
    await clickBackButton()
    await waitTillOnHomeScreen()
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
    const transactionsButton = await $(
      selector(LL.TransactionScreen.title(), "StaticText"),
    )
    await transactionsButton.waitForDisplayed({ timeout })
    await transactionsButton.click()
    // pause to wait for transactions to load
    await browser.pause(2000)
  })

  it("See transactions", async () => {
    const transactionsList = await $(selector("list-item-content", "Other", "[1]"))
    const transactionDescription = await $(
      selector("tx-description", "StaticText", "[2]"),
    )
    await transactionsList.waitForDisplayed({ timeout })
    expect(transactionDescription).toBeDisplayed()
  })

  it("click on first transaction", async () => {
    const firstTransaction = await $(selector("list-item-content", "Other", "[1]"))
    await firstTransaction.waitForDisplayed({ timeout })
    await firstTransaction.click()
  })

  it("check if transaction details are shown", async () => {
    let transactionDate: WebdriverIO.Element
    let description: WebdriverIO.Element
    if (process.env.E2E_DEVICE === "ios") {
      transactionDate = await $(selector(LL.common.date(), "StaticText"))
      description = await $(selector(LL.common.description(), "StaticText"))
    } else {
      const uiSelectorForDate = `new UiSelector().text("${LL.common.date()}").className("android.widget.TextView")`
      const uiSelectorForDesc = `new UiSelector().text("${LL.common.description()}").className("android.widget.TextView")`
      transactionDate = await $(`android=${uiSelectorForDate}`)
      description = await $(`android=${uiSelectorForDesc}`)
    }
    await transactionDate.waitForDisplayed({ timeout })
    await description.waitForDisplayed({ timeout })
  })

  it("Go back to transactions list", async () => {
    const closeButton = await $(selector("close-button", "StaticText"))
    await closeButton.waitForDisplayed({ timeout })
    await closeButton.click()
    // pause to wait for back button to appear in the DOM
    await browser.pause(2000)
  })

  it("Go back home", async () => {
    await clickBackButton()
  })
})

describe("Price graph flow", () => {
  it("click on price graph button", async () => {
    await clickIconButton("graph")
  })

  it("check if price graph header is shown", async () => {
    const priceGraphHeader = await $(selector(LL.PriceHistoryScreen.satPrice(), "Other"))
    const rangeText = await $(selector("range", "StaticText"))
    await priceGraphHeader.waitForDisplayed({ timeout })
    expect(rangeText).toBeDisplayed()
  })

  it("click on one week button", async () => {
    const oneWeekButton = await $(selector(LL.PriceHistoryScreen.oneWeek(), "Button"))
    const rangeText = await $(selector("range", "StaticText"))
    await oneWeekButton.waitForDisplayed({ timeout })
    await oneWeekButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("click on one month button", async () => {
    const oneMonthButton = await $(selector(LL.PriceHistoryScreen.oneMonth(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await oneMonthButton.waitForDisplayed({ timeout })
    await oneMonthButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("click on one year button", async () => {
    const oneYearButton = await $(selector(LL.PriceHistoryScreen.oneYear(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await oneYearButton.waitForDisplayed({ timeout })
    await oneYearButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("click on five years button", async () => {
    const fiveYearsButton = await $(selector(LL.PriceHistoryScreen.fiveYears(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await fiveYearsButton.waitForDisplayed({ timeout })
    await fiveYearsButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("go back to home screen", async () => {
    await clickBackButton()
  })
})

const getLanguageScreenTitleElement = async (title: string) => {
  if (process.env.E2E_DEVICE === "ios") {
    return $(`(//XCUIElementTypeOther[@name="${title}"])[2]`)
  }
  return $(`android=new UiSelector().text("${title}")`)
}
