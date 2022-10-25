export function selector(id: string) {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementTypeButton[@name="${id}"]`
  }
  return `~${id}`
}
