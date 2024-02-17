import { timeout } from "./config"

export const tap = async (match: Detox.NativeMatcher) => {
  const el = element(match)
  await waitFor(el).toBeVisible().withTimeout(timeout)
  await el.tap()
}

export const setLocalEnvironment = async () => {
  const buildBtn = element(by.id("logo-button"))
  await waitFor(buildBtn)
    .toBeVisible()
    // Wait for 5 mins because metro bundler might not finish sync
    .withTimeout(5 * 600000)
  await buildBtn.multiTap(3)

  const logoutBtn = element(by.id("logout button"))
  await waitFor(logoutBtn).toBeVisible().withTimeout(timeout)

  const envBtn = element(by.id("Local Button"))
  const developerScreenSV = by.id("developer-screen-scroll-view")

  await waitFor(envBtn)
    .toBeVisible()
    .whileElement(developerScreenSV)
    .scroll(400, "down", NaN, 0.85)
  await envBtn.tap()

  const saveChangesBtn = element(by.id("Save Changes"))
  await saveChangesBtn.tap()

  const stagingInstanceText = element(by.text(`Galoy Instance: Local`))
  await waitFor(stagingInstanceText).toBeVisible().withTimeout(10000)

  await tap(by.id("Back"))
}
