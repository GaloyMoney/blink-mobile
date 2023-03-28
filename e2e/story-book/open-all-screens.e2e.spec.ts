import { scrollDownOnLeftSideOfScreen } from "e2e/utils"

const clickNavigator = async () => {
  const navigator = $(`//*[contains(@text, 'NAVIGATOR')]`)
  await navigator.waitForDisplayed()
  await navigator.click()
  await browser.pause(1000)
}

const clickUpperRightQuadrant = async () => {
  const { height, width } = await browser.getWindowRect()
  const x = width - width / 4
  const y = height / 4
  return browser.touchAction({
    action: "tap",
    x,
    y,
  })
}

const openAndCloseStory = async (story: WebdriverIO.Element) => {
  await story.waitForDisplayed()
  await story.click()
  await clickUpperRightQuadrant()
  await browser.pause(2000)
  await clickNavigator()
}

const openAllStoriesOnScreen = async (lastSeenStory: string | null) => {
  const visibleStories = await $$(`//*[contains(@content-desc,"Storybook.ListItem")]`)
  const lastSeenStoryIndex = visibleStories.findIndex(
    (story) => story.elementId === lastSeenStory,
  )
  const newStories = visibleStories.slice(lastSeenStoryIndex + 1)

  for (const story of newStories) {
    await openAndCloseStory(story)
  }

  return newStories[newStories.length - 1]?.elementId
}

describe("Storybook screens", () => {
  it("should all open", async () => {
    await clickNavigator()

    let lastSeenStory = null
    do {
      lastSeenStory = await openAllStoriesOnScreen(lastSeenStory)
      await scrollDownOnLeftSideOfScreen()
    } while (lastSeenStory)
  })
})
