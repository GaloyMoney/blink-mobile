export async function swipe() {
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
  } catch (e) {}
}
