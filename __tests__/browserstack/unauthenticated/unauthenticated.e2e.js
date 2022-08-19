var client = require("@galoymoney/client")

describe("Unauthenticated navigation renders correctly", () => {
  it("Welcome flow", async () => {
    let el1 = driver.element('//XCUIElementTypeButton[@name="Get Started"]')
    el1.click()
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
