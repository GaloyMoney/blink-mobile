import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { goBack } from "./go-back"
import { selector } from "./selector"

const timeout = 30000

loadLocale("en")
const LL = i18nObject("en")

export const clickGaloyButton = async (title: string) => {
  const galoyButton = await $(selector(title, "Button"))
  await galoyButton.waitForEnabled({ timeout })
  await galoyButton.click()
}

export const clickBackButton = async () => {
  const backButton = await $(goBack())
  await backButton.waitForEnabled({ timeout })
  await backButton.click()
}

export const clickIconButton = async (titleOrName: string) => {
  const iconButton = await $(selector(titleOrName, "Other"))
  await iconButton.waitForEnabled({ timeout })
  await iconButton.click()
}

export const waitTillOnHomeScreen = async () => {
  const currentBalanceHeader = await $(selector(LL.HomeScreen.myAccounts(), "StaticText"))
  await currentBalanceHeader.waitForDisplayed({ timeout })
}

export const waitTillTextDisplayed = async (text: string) => {
  const textElement = await $(selector(text, "StaticText"))
  await textElement.waitForDisplayed({ timeout })
}

export const waitTillSettingDisplayed = async (text: string) => {
  await waitTillTextDisplayed(text)
}

export const clickOnSetting = async (title: string) => {
  const settingButton = await $(selector(title, "StaticText"))
  await settingButton.waitForEnabled({ timeout })
  await settingButton.click()
}

export const clickOnText = async (text: string) => {
  const textButton = await $(selector(text, "StaticText"))
  await textButton.waitForEnabled({ timeout })
  await textButton.click()
}
