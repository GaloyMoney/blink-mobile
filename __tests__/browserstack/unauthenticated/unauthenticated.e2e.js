var assert = require("assert")
var client = require("@galoymoney/client")

describe("Unauthenticated navigation renders correctly", () => {
  it("Welcome flow", async () => {
    const getStartedButton = await $(
      `~${client.translateUnknown("GetStartedScreen.getStarted")}`,
    )
    await getStartedButton.click()
    assert.ok(await $("~Bitcoin:").isDisplayed())
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.care")}`).isDisplayed(),
    )

    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.bank")}`).isDisplayed(),
    )
    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.before")}`).isDisplayed(),
    )
    browser.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.learn")}`).isDisplayed(),
    )
    assert.ok(
      await $(
        `~${client.translateUnknown("WelcomeFirstScreen.learnToEarn")}`,
      ).isDisplayed(),
    )
    await $(`~${client.translateUnknown("WelcomeFirstScreen.learnToEarn")}`).click()
  })
})
