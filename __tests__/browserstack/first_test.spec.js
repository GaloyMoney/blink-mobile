const assert = require('assert');

describe("Home Page", () => {
  it("there is get started button in get started page", async () => {
    const getStartedButtonEl = await $('~getStarted');
    await getStartedButtonEl.waitForDisplayed(11000);
  })
})
