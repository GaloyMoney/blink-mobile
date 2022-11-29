import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { swipe, selector } from "./utils"

describe("Welcome Screen Flow", async () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000

  it("loads and clicks 'Get Started button' ", async () => {
    const getStartedButton = await $(selector(LL.GetStartedScreen.getStarted()))
    await getStartedButton.waitForDisplayed({ timeout })
    await getStartedButton.click()
    expect(true).toBeTruthy()
  })

  it("swipes Why Should I Care?", async () => {
    const caresText = await $(selector(LL.WelcomeFirstScreen.care(), "StaticText"))
    await caresText.waitForDisplayed({ timeout })
    await swipe()
  })

  it("swipes Bitcoin is designed to let you...bank", async () => {
    const bankText = await $(selector(LL.WelcomeFirstScreen.bank(), "StaticText"))
    await bankText.waitForDisplayed({ timeout })
    await swipe()
  })

  it("swipes Before Bitcoin people had to...", async () => {
    const beforeText = await $(selector(LL.WelcomeFirstScreen.before(), "StaticText"))
    await beforeText.waitForDisplayed({ timeout })
    await swipe()
  })

  it("clicks 'Learn to Earn' and enters the main app", async () => {
    const learnButton = await $(selector(LL.WelcomeFirstScreen.learnToEarn()))
    await learnButton.waitForDisplayed({ timeout })
    await learnButton.click()
    expect(true).toBeTruthy()
  })
})
