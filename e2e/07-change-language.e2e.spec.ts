import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"

describe("Change Language Flow", async () => {
  loadLocale("en")
  loadLocale("es")
  const enLL = i18nObject("en")
  const esLL = i18nObject("es")
  const timeout = 30000

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

  it("click go back to settings screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
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

const getLanguageScreenTitleElement = async (title: string) => {
  if (process.env.E2E_DEVICE === "ios") {
    return $(`(//XCUIElementTypeOther[@name="${title}"])[2]`)
  }
  return $(`android=new UiSelector().text("${title}")`)
}
