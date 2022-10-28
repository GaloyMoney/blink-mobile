export function selector(id: string, iosType?: string) {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementType${iosType ?? "Button"}[@name="${id}"]`
  }
  return `~${id}`
}
