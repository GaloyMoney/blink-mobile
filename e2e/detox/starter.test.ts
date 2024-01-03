import { expect } from "detox"

describe("Example", () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  it("set staging environment", async () => {
    const buildBtn = element(by.id("logo-button"))
    // Wait for 2 mins because metro bundler might not finish sync
    await waitFor(buildBtn).toBeVisible().withTimeout(1200000)
    await buildBtn.multiTap(3)

    const logoutBtn = element(by.id("logout button"))
    await expect(logoutBtn).toBeVisible()

    const stagingBtn = element(by.id("Staging Button"))
    const developerScreenSV = by.id("developer-screen-scroll-view")

    await waitFor(stagingBtn)
      .toBeVisible()
      .whileElement(developerScreenSV)
      .scroll(200, "down", NaN, 0.85)
    await stagingBtn.tap()

    const saveChangesBtn = element(by.id("Save Changes"))
    await saveChangesBtn.tap()

    const stagingInstanceText = element(by.text("Galoy Instance: Staging"))
    await waitFor(stagingInstanceText).toBeVisible().withTimeout(10000)

    const backBtn = element(by.id("Back"))
    await expect(backBtn).toBeVisible()
    await backBtn.tap()
  })
})
