var client = require("@galoymoney/client")

describe("Unauthenticated navigation renders correctly", () => {
  it("Welcome flow", async () => {
    await $(`~${client.translateUnknown("GetStartedScreen.getStarted")}`).waitForExist()
    await $(`~${client.translateUnknown("GetStartedScreen.getStarted")}`).touchAction([
      "press",
    ])
    expect(await $("~Bitcoin:").isDisplayed()).toBeTruthy()
    expect(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.care")}`).isDisplayed(),
    ).toBeTruthy()

    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.bank")}`).isDisplayed(),
    ).toBeTruthy()
    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.before")}`).isDisplayed(),
    ).toBeTruthy()
    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.learn")}`).isDisplayed(),
    ).toBeTruthy()
    expect(
      await $(
        `~${client.translateUnknown("WelcomeFirstScreen.learnToEarn")}`,
      ).isDisplayed(),
    ).toBeTruthy()
    await $(`~${client.translateUnknown("WelcomeFirstScreen.learnToEarn")}`).touchAction([
      "press",
    ])
  })
})
