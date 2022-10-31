export async function enter(input?) {
  if (process.env.E2E_DEVICE === "ios") {
    await input.sendKeys(["\n"])
  }
  await browser.pressKeyCode(66)
}
