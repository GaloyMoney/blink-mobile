const assert = require('assert');

describe("Home Page", () => {
  it("there is version headline in home page initial", async () => {
    const getStartedVersionHeadlineEl = await $('~GetStartedScreen.VersionHeadline');
    await getStartedVersionHeadlineEl.waitForDisplayed({ timeout: 120 * 1000 });
  })
})
