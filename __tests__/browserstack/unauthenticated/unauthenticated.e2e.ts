import { translate } from "../../../app/utils/translate"
import { getStartedButton } from "./screens/GetStartedScreen"

describe("Unauthenticated navigation renders correctly", () => {
  it("Welcome flow", async () => {
    await (await getStartedButton()).click()
    expect(await $("~Bitcoin:").isDisplayed()).toBeTruthy()
    expect(await $(`~${translate("WelcomeFirstScreen.care")}`).isDisplayed()).toBeTruthy()

    driver.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(await $(`~${translate("WelcomeFirstScreen.bank")}`).isDisplayed()).toBeTruthy()
    driver.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${translate("WelcomeFirstScreen.before")}`).isDisplayed(),
    ).toBeTruthy()
    driver.swipe({ x: 800, y: 1500 }, { x: 150, y: 1500 })
    expect(
      await $(`~${translate("WelcomeFirstScreen.learn")}`).isDisplayed(),
    ).toBeTruthy()
    expect(
      await $(`~${translate("WelcomeFirstScreen.learnToEarn")}`).isDisplayed(),
    ).toBeTruthy()
    await $(`~${translate("WelcomeFirstScreen.learnToEarn")}`).touchAction(["press"])
  })
})
