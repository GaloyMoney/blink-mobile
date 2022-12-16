export function goBack() {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementTypeButton[@name="Go back"]`
  }
  return `~Go back`
}
