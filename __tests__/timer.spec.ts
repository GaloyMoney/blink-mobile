import { formatTimeToMempool } from "@app/screens/transaction-detail-screen/format-time"
import { parseTimer } from "../app/utils/timer"
import { loadLocale } from "@app/i18n/i18n-util.sync"
import { i18nObject } from "@app/i18n/i18n-util"

describe("parseTimer", () => {
  it("parse time when is more than 1 minute", () => {
    const outputTime = parseTimer(65)
    expect(outputTime).toStrictEqual("01:05")
  })

  it("parse time when is less than 1 minute", () => {
    const outputTime = parseTimer(40)
    expect(outputTime).toStrictEqual("00:40")
  })

  it("parse time when is less than 10 second", () => {
    const outputTime = parseTimer(8)
    expect(outputTime).toStrictEqual("00:08")
  })

  it("parse time when is negative", () => {
    const outputTime = parseTimer(-5)
    expect(outputTime).toStrictEqual("00:00")
  })
})

describe("formatTimeToMempool", () => {
  jest.useFakeTimers()
  jest.setSystemTime(1701819669000)

  loadLocale("en")
  const LL = i18nObject("en")

  it("format time when is more than 1 minute", () => {
    const outputTime = formatTimeToMempool(1701819734, LL, "en")
    expect(outputTime).toStrictEqual("in 1 minute")
  })

  it("format time when is less than 1 minute", () => {
    const outputTime = formatTimeToMempool(1701819709, LL, "en")
    expect(outputTime).toStrictEqual("in 40 seconds")
  })

  it("format time when is less than 10 second", () => {
    const outputTime = formatTimeToMempool(1701819678, LL, "en")
    expect(outputTime).toStrictEqual("in 9 seconds")
  })

  it("format time when is negative", () => {
    const outputTime = formatTimeToMempool(1701819669, LL, "en")
    expect(outputTime).toStrictEqual(LL.TransactionDetailScreen.momentarily())
  })
})
