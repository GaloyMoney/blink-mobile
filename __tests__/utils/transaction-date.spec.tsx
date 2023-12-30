import { formatDateForTransaction } from "@app/components/transaction-date"

describe("formatDateForTransaction", () => {
  it("should convert to local timezone", () => {
    const createdAt = 1620849600
    const timezone = "America/El_Salvador"
    const locale = "en"

    expect(
      formatDateForTransaction({ createdAt, locale, timezone, includeTime: true }),
    ).toEqual("Wednesday, May 12, 2021 at 2:00:00 PM")
  })

  it("should adapt to the language", () => {
    const createdAt = 1620849600
    const locale = "es"
    const timezone = "America/El_Salvador"

    expect(
      formatDateForTransaction({ createdAt, locale, timezone, includeTime: true }),
    ).toEqual("miércoles, 12 de mayo de 2021, 14:00:00")
  })

  it("if tx is from 2h ago, use relative time instead", () => {
    const createdAt = 1620849600
    const now = (1620849600 + 60 * 60 * 2) * 1000

    const locale = "es"
    const timezone = "America/El_Salvador"
    expect(
      formatDateForTransaction({ createdAt, locale, timezone, includeTime: true, now }),
    ).toEqual("hace 2 horas")
  })

  it("if tx is from 5 seconds ago, use relative time instead", () => {
    const createdAt = 1620849600
    const now = (1620849600 + 5) * 1000
    const locale = "en"
    const timezone = "America/El_Salvador"

    expect(
      formatDateForTransaction({ createdAt, locale, timezone, includeTime: true, now }),
    ).toEqual("5 seconds ago")
  })
})
