export function selector(id: string, iosType?: string, iosExtraPredicate?: string) {
  if (iosType) {
    return `-ios predicate string:type == "XCUIElementType${iosType}" AND name == "${id}"${
      iosExtraPredicate ?? ""
    }`
  }
  return `~${id}`
}
