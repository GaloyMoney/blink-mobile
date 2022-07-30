var assert = require("assert")
var client = require("@galoymoney/client")

client.setLocale("en")

describe("Home Page", () => {
  it("get started button redirects to welcome flow", async () => {
    const getStartedButton = await $(
      `~${client.translateUnknown("GetStartedScreen.getStarted")}`,
    )
    await getStartedButton.click()
    assert.ok(await $("~Bitcoin:").isDisplayed())
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.care")}`).isDisplayed(),
    )
    browser.execute("mobile: swipe", {
      direction: "right",
    })
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.bank")}`).isDisplayed(),
    )
    browser.execute("mobile: swipe", {
      direction: "right",
    })
    assert.ok(
      await $(`~${client.translateUnknown("WelcomeFirstScreen.before")}`).isDisplayed(),
    )
  })
})
