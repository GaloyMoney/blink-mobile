export async function enter(input: WebdriverIO.Element) {
  if (process.env.E2E_DEVICE === "ios") {
    await input.sendKeys(["\n"])
  }
  await browser.keys("\uE007")
}
