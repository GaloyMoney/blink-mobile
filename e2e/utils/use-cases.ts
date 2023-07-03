import { TranslationFunctions } from "@app/i18n/i18n-types"
import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { timeout } from "./config"
import {
  clickButton,
  clickOnText,
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
  await clickOnText(title)
}

export const Tab = {
  Home: LL.HomeScreen.title(),
  Contacts: LL.ContactsScreen.title(),
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
