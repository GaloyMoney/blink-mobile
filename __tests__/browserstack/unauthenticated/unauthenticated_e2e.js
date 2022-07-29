describe("Home Page", () => {
  it("there is get started button in get started page", async () => {
    const getStartedButtonEl = await $("~getStarted")
    await getStartedButtonEl.waitForDisplayed({ timeout: 5 * 60 * 1000 })
  })
  it("get started button redirects to welcome flow", async () => {
    const getStartedButtonEl = await $("~getStarted")
    await getStartedButtonEl.click()
    const welcomeFlowEl = await $("~welcomeFlow")
    await welcomeFlowEl.waitForDisplayed({ timeout: 5 * 60 * 1000 })
  })
})
