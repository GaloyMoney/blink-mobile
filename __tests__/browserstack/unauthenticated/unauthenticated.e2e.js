var client = require("@galoymoney/client")

describe("Unauthenticated navigation renders correctly", () => {
  it("Welcome flow", async () => {
    await $(`~${translateUnknown("GetStartedScreen.getStarted")}`).waitForExist()
    await $(`~${translateUnknown("GetStartedScreen.getStarted")}`).click()
    expect(await $("~Bitcoin:").isDisplayed()).toBeTruthy()
    expect(
      await $(`~${translateUnknown("WelcomeFirstScreen.care")}`).isDisplayed(),
    ).toBeTruthy()

    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${translateUnknown("WelcomeFirstScreen.bank")}`).isDisplayed(),
    ).toBeTruthy()
    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${translateUnknown("WelcomeFirstScreen.before")}`).isDisplayed(),
    ).toBeTruthy()
    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${translateUnknown("WelcomeFirstScreen.learn")}`).isDisplayed(),
    ).toBeTruthy()
    expect(
      await $(`~${translateUnknown("WelcomeFirstScreen.learnToEarn")}`).isDisplayed(),
    ).toBeTruthy()
    await $(`~${translateUnknown("WelcomeFirstScreen.learnToEarn")}`).click()
  })
})
