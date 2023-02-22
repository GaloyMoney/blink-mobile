import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { goBack, selector } from "./utils"

describe("Price graph flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("should click on price graph button", async () => {
    const priceGraphButton = await $(selector("price button", "Button"))
    await priceGraphButton.waitForDisplayed({ timeout })
    await priceGraphButton.click()
  })

  it("should check if price graph header is shown", async () => {
    const priceGraphHeader = await $(selector(LL.PriceScreen.satPrice(), "Other"))
    const rangeText = await $(selector("range", "StaticText"))
    await priceGraphHeader.waitForDisplayed({ timeout })
    expect(priceGraphHeader).toBeDisplayed()
    expect(rangeText).toBeDisplayed()
  })

  it("should click on one week button", async () => {
    const oneWeekButton = await $(selector(LL.PriceScreen.oneWeek(), "Button"))
    const rangeText = await $(selector("range", "StaticText"))
    await oneWeekButton.waitForDisplayed({ timeout })
    await oneWeekButton.click()
    expect(rangeText).toBeDisabled()
  })

  it("should click on one month button", async () => {
    const oneMonthButton = await $(selector(LL.PriceScreen.oneMonth(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await oneMonthButton.waitForDisplayed({ timeout })
    await oneMonthButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("should click on one year button", async () => {
    const oneYearButton = await $(selector(LL.PriceScreen.oneYear(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await oneYearButton.waitForDisplayed({ timeout })
    await oneYearButton.click()
    expect(rangeText).toBeDisplayed()
  })

  it("should click on five years button", async () => {
    const fiveYearsButton = await $(selector(LL.PriceScreen.fiveYears(), "Button"))
    const rangeText = await $(selector("range", "Other"))
    await fiveYearsButton.waitForDisplayed({ timeout })
    await fiveYearsButton.click()
    expect(rangeText).toBeDisabled()
  })

  it("should go back to home screen", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})
