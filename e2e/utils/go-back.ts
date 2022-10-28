export function goBack() {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementTypeButton[@name="Go back"]`
  }
  return `//android.widget.Button[@content-desc="Go back"]/android.widget.ImageView`
}
