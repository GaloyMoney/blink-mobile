import { translate } from "../../../../app/utils/translate"

export const getStartedButton = () => {
  const selectorAndroid = `${translate("GetStartedScreen.getStarted")}`
  const selectorIOS = `//XCUIElementTypeButton[@name="${translate(
    "GetStartedScreen.getStarted",
  )}"]`
  const selectorType = driver.isAndroid ? "android" : "ios"
  const selector = driver.isAndroid ? selectorAndroid : selectorIOS
  return $(`${selectorType}=${selector}`)
}
