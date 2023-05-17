import parsePhoneNumber from "libphonenumber-js"

describe("parsePhoneNumber", () => {
  it("correctly handles extra 0", () => {
    const phoneWithLeadingZero = parsePhoneNumber("02012345678", "GB")
    const phoneWithoutLeadingZero = parsePhoneNumber("2012345678", "GB")
    expect(phoneWithLeadingZero?.isValid()).toBe(true)
    expect(phoneWithoutLeadingZero?.isValid()).toBe(true)
    expect(phoneWithLeadingZero?.number).toBe(phoneWithoutLeadingZero?.number)
  })
})
