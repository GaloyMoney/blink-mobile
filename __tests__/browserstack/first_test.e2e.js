describe("Home Page", () => {
  it("there is get started button in get started page", async () => {
    const getStartedButtonEl = await $("~Get Started")
    await getStartedButtonEl.waitForDisplayed({ timeout: 5 * 60 * 1000 })
  })
})
