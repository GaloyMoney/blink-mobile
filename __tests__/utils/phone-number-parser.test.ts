import { parsePhoneNumberFromString } from "libphonenumber-js/mobile"

describe("parsePhoneNumber", () => {
  it("correctly handles extra 0", () => {
    const phoneWithLeadingZero = parsePhoneNumberFromString("07400123456", "GB")
    const phoneWithoutLeadingZero = parsePhoneNumberFromString("7400123456", "GB")
    expect(phoneWithLeadingZero?.isValid()).toBe(true)
    expect(phoneWithoutLeadingZero?.isValid()).toBe(true)
    expect(phoneWithLeadingZero?.number).toBe(phoneWithoutLeadingZero?.number)
  })
})
