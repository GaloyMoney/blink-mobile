import { isUpdateAvailableOrRequired } from "@app/components/app-update/app-update.logic"
import { Platform } from "react-native"

const mobileVersions = [
  {
    __typename: "MobileVersions",
    platform: "android",
    currentSupported: 294,
    minSupported: 182,
  },
  {
    __typename: "MobileVersions",
    platform: "ios",
    currentSupported: 295,
    minSupported: 182,
  },
]

const OS = "ios" as Platform["OS"]

describe("testing isUpdateAvailableOrRequired with normal build number", () => {
  it("outdated should return true", () => {
    const buildNumber = 150
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(true)
    expect(result.available).toBe(true)
  })

  it("above minSupported should should return true for available", () => {
    const buildNumber = 200
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(false)
    expect(result.available).toBe(true)
  })

  it("current should return false", () => {
    const buildNumber = 295
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(false)
    expect(result.available).toBe(false)
  })

  it("above should return false", () => {
    const buildNumber = 300
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(false)
    expect(result.available).toBe(false)
  })
})

describe("testing isUpdateAvailableOrRequired with android abi", () => {
  it("outdated should return true", () => {
    const buildNumber = 150 + 10000000
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(true)
    expect(result.available).toBe(true)
  })

  it("above minSupported should should return true for available", () => {
    const buildNumber = 200 + 10000000
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(false)
    expect(result.available).toBe(true)
  })

  it("current should return false", () => {
    const buildNumber = 295 + 20000000
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(false)
    expect(result.available).toBe(false)
  })

  it("above should return false", () => {
    const buildNumber = 300 + 30000000
    const result = isUpdateAvailableOrRequired({ buildNumber, mobileVersions, OS })
    expect(result.required).toBe(false)
    expect(result.available).toBe(false)
  })
})
