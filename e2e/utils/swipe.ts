export async function swipeLeft() {
  try {
    const { height, width } = await browser.getWindowRect()
    const y = height / 2
    const toX = width / 8
    const fromX = width - toX
    await browser.touchAction([
      { action: "press", x: fromX, y },
      { action: "wait", ms: 500 },
      { action: "moveTo", x: toX, y },
      "release",
    ])
  } catch (err) {
    console.error(err)
  }
}

export async function swipeRight() {
  try {
    const { height, width } = await browser.getWindowRect()
    const y = height / 2
    const fromX = width / 8
    const toX = width - fromX
    await browser.touchAction([
      { action: "press", x: fromX, y },
      { action: "wait", ms: 500 },
      { action: "moveTo", x: toX, y },
      "release",
    ])
  } catch (err) {
    console.error(err)
  }
}
