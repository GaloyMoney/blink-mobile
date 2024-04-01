import { TranslationFunctions } from "@app/i18n/i18n-types"

import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { timeout } from "./config"
import {
  clickButton,
  clickPressable,
  selector,
  waitTillPressableDisplayed,
  waitTillTextDisplayed,
} from "./controls"

loadLocale("en")
const LL = i18nObject("en")

export const clickBackButton = async () => {
  await clickButton("Go back")
}

export const clickIcon = async (titleOrName: string) => {
  const iconButton = await $(selector(titleOrName, "Other"))
  await iconButton.waitForEnabled({ timeout })
  await iconButton.click()
}

export const waitTillOnHomeScreen = async () => {
  await waitTillTextDisplayed(LL.HomeScreen.myAccounts())
}

export const waitTillSettingDisplayed = async (text: string) => {
  await waitTillTextDisplayed(text)
}

export const clickOnSetting = async (title: string) => {
  await clickPressable(title)
}

export const Tab = {
  Home: LL.HomeScreen.title(),
  People: LL.PeopleScreen.title(),
  Map: LL.MapScreen.title(),
  Earn: LL.EarnScreen.title(),
} as const

export type Tab = (typeof Tab)[keyof typeof Tab]

export const clickOnBottomTab = async (tab: Tab) => {
  await clickButton(tab)
}

export const addSmallAmount = async (LL: TranslationFunctions) => {
  await clickPressable("Amount Input Button")
  await enter2CentsIntoNumberPad(LL)
  await waitTillPressableDisplayed("Amount Input Button")
}

export const enter2CentsIntoNumberPad = async (LL: TranslationFunctions) => {
  await clickPressable("Key .")
  await clickPressable("Key 0")
  await clickPressable("Key 2")
  await clickButton(LL.AmountInputScreen.setAmount())
}

const screenTitleSelector = (title: string) => {
  if (process.env.E2E_DEVICE === "ios") {
    return `(//XCUIElementTypeOther[@name="${title}"])[2]`
  }
  return `android=new UiSelector().text("${title}")`
}

export const waitTillScreenTitleShowing = async (title: string) => {
  const screenTitle = await $(screenTitleSelector(title))
  await screenTitle.waitForDisplayed({ timeout })
}

export const isScreenTitleShowing = async (title: string) => {
  const screenTitle = await $(screenTitleSelector(title))
  return screenTitle.isDisplayed()
}
