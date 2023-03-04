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
