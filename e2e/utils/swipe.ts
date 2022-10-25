export async function swipe() {
  if (process.env.E2E_DEVICE === "ios") {
    await browser.touchAction([
      { action: "press", x: 400, y: 600 },
      { action: "wait", ms: 500 },
      { action: "moveTo", x: 60, y: 600 },
      "release",
    ])
  } else {
    await browser.touchAction([
      { action: "press", x: 800, y: 600 },
      { action: "wait", ms: 500 },
      { action: "moveTo", x: 100, y: 600 },
      "release",
    ])
  }
}
