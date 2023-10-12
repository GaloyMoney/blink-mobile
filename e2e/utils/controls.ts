const timeout = 30000

export const selector = (id: string, iosType?: string, iosExtraXPath?: string) => {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementType${iosType}[@name="${id}"]${iosExtraXPath ?? ""}`
  }
  return `~${id}`
}

const findById = (id: string, iosType?: string, iosExtraXPath?: string) => {
  if (process.env.E2E_DEVICE === "ios") {
    return `//XCUIElementType${iosType}[@name="${id}"]${iosExtraXPath ?? ""}`
  }
  return `id=${id}`
}

export const clickAlertLastButton = async (title: string) => {
  const okButtonId = process.env.E2E_DEVICE === "ios" ? title : "android:id/button1"
  const okButton = await $(findById(okButtonId, "Button"))
  await okButton.waitForDisplayed({ timeout })
  await okButton.click()
}

export const clickButton = async (title: string, wait = true) => {
  const button = await $(selector(title, "Button"))
  if (wait) await button.waitForEnabled({ timeout })
  await button.click()
}

export const waitTillButtonDisplayed = async (title: string) => {
  const button = await $(selector(title, "Button"))
  await button.waitForDisplayed({ timeout })
}

export const clickPressable = async (title: string) => {
  const button = await $(selector(title, "Other"))
  await button.waitForEnabled({ timeout })
  await button.click()
}

export const waitTillPressableDisplayed = async (title: string) => {
  const button = await $(selector(title, "Other"))
  await button.waitForDisplayed({ timeout })
}

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

export const setInputValue = async (el: WebdriverIO.Element, value: string) => {
  try {
    await el.clearValue()
    await value.split("").reduce(async (prev: Promise<string>, current: string) => {
      const nextString = `${await prev}${current}`
      await el.addValue(current)
      await el.waitUntil(
        // eslint-disable-next-line func-names
        async function () {
          const text = await el.getText()
          return text === nextString
        },
        {
          timeout: 120000,
          interval: 10,
        },
      )

      return nextString
    }, Promise.resolve(""))
  } catch (e) {
    console.log("SetInputValue Error:", e)
  }
}

export const enter = async (input: WebdriverIO.Element) => {
  if (process.env.E2E_DEVICE === "ios") {
    await input.sendKeys(["\n"])
  }
  await browser.pressKeyCode(66)
}

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
  } catch (err) {
    console.error(err)
  }
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
  } catch (err) {
    console.error(err)
  }
}

export const scrollDownOnLeftSideOfScreen = async () => {
  const { height, width } = await browser.getWindowRect()
  const x = width / 4
  const toY = height / 2
  const fromY = height - height / 4

  await browser.touchAction([
    { action: "press", x, y: fromY },
    { action: "wait", ms: 500 },
    { action: "moveTo", x, y: toY },
    "release",
  ])
}

export const waitTillTextDisplayed = async (text: string) => {
  let elementSelector
  if (process.env.E2E_DEVICE === "ios") {
    elementSelector = `//XCUIElementTypeStaticText[@name="${text}"]`
  } else {
    elementSelector = `android=new UiSelector().text("${text}").className("android.widget.TextView")`
  }

  const textElement = await $(elementSelector)
  await textElement.waitForDisplayed({ timeout })
}

export const clickOnText = async (text: string) => {
  let elementSelector
  if (process.env.E2E_DEVICE === "ios") {
    elementSelector = `//XCUIElementTypeStaticText[@name="${text}"]`
  } else {
    elementSelector = `android=new UiSelector().text("${text}").className("android.widget.TextView")`
  }

  const textElement = await $(elementSelector)
  await textElement.waitForEnabled({ timeout })
  await textElement.click()
}
