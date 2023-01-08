export async function scrollDown() {
  try {
    const { height, width } = await browser.getWindowRect()
    const x = width / 2
    const toY = height / 8
    const fromY = height - height / 8

    await browser.touchAction([
      { action: "press", x, y: fromY },
      { action: "wait", ms: 500 },
      { action: "moveTo", x, y: toY },
      "release",
    ])
  } catch (e) {}
}

export async function scrollUp() {
  try {
    const { height, width } = await browser.getWindowRect()
    const x = width / 2
    const toY = height - height / 4
    const fromY = height / 4

    await browser.touchAction([
      { action: "press", x, y: fromY },
      { action: "wait", ms: 500 },
      { action: "moveTo", x, y: toY },
      "release",
    ])
  } catch (e) {}
}
