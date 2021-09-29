import { computeCount, parseTimer } from "../app/utils/timer"

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

  it("parse time when is less than 10 second", () => {
    const outputTime = parseTimer(8)
    expect(outputTime).toStrictEqual("00:08")
  })

  it("parse time when is negative", () => {
    const outputTime = parseTimer(-5)
    expect(outputTime).toStrictEqual("00:00")
  })
})

describe("computeCount", () => {
  it("compute count from 10 sec ago and current time", () => {
    const startTime = new Date()
    startTime.setSeconds(startTime.getSeconds() - 10)
    const outputCount = computeCount(startTime)
    expect(outputCount).toStrictEqual(50)
  })

  it("compute count from 70 sec ago and current time", () => {
    const startTime = new Date()
    startTime.setSeconds(startTime.getSeconds() - 70)
    const outputCount = computeCount(startTime)
    expect(outputCount).toStrictEqual(-10)
  })
})
