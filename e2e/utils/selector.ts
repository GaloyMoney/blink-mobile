export function selector(id: string, iosType?: string, iosExtraXPath?: string) {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementType${iosType ?? "Button"}[@name="${id}"]${iosExtraXPath ?? ""}`
  }
  return `~${id}`
}
