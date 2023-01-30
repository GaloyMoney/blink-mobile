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
    browser.pause(3000)
  })

  it("clicks Spanish", async () => {
    const languageButton = await $(selector(enLL.Languages.es(), "StaticText"))
    await languageButton.waitForDisplayed({ timeout })
    await languageButton.click()
    await browser.pause(6000)
  })

  it("clicks Predetermined", async () => {
    const languageButton = await $(selector(esLL.Languages.DEFAULT(), "StaticText"))
    await languageButton.waitForDisplayed({ timeout })
    await languageButton.click()
    await browser.pause(6000)
  })

  it("click go back to settings screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    browser.pause(2000)
  })

  it("click go back to home screen", async () => {
    const backButton = await $(goBack())
    await backButton.waitForDisplayed({ timeout })
    await backButton.click()
    await browser.pause(1000)
  })
})
