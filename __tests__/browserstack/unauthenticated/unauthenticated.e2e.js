var assert = require("assert")
import { translateUnknown, setLocale } from "@galoymoney/client"

setLocale("en")

describe("Home Page", () => {
  it("get started button redirects to welcome flow", async () => {
    const getStartedButton = await $(
      `~${translateUnknown("GetStartedScreen.getStarted")}`,
    )
    await getStartedButton.click()
    assert.ok(await $("~Bitcoin:").isDisplayed())
    assert.ok(await $(`~${translateUnknown("WelcomeFirstScreen.care")}`).isDisplayed())
    browser.execute("mobile: swipe", {
      direction: "right",
    })
    assert.ok(await $(`~${translateUnknown("WelcomeFirstScreen.bank")}`).isDisplayed())
    browser.execute("mobile: swipe", {
      direction: "right",
    })
    assert.ok(await $(`~${translateUnknown("WelcomeFirstScreen.before")}`).isDisplayed())
  })
})
