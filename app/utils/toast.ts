import Toast from "react-native-toast-message"
import { i18nObject } from "@app/i18n/i18n-util"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { logToastShown } from "./analytics"

export const toastShow = ({
  message,
  currentTranslation,
  onHide,
  type = "error",
}: {
  message: ((translations: TranslationFunctions) => string) | string
  currentTranslation?: TranslationFunctions
  onHide?: () => void
  type?: "error" | "success" | "warning"
}): void => {
  const englishTranslation = i18nObject("en")
  const englishMessage =
    typeof message === "function" ? message(englishTranslation) : message
  const translations = currentTranslation || englishTranslation
  const translatedMessage =
    typeof message === "function" ? message(translations) : message

  logToastShown({
    message: englishMessage,
    type,
    isTranslated: translatedMessage !== englishMessage,
  })

  Toast.show({
    type,
    text1: type === "error" ? translations.common.error() : translations.common.success(),
    text2: translatedMessage,
    position: "bottom",
    bottomOffset: 80,
    onHide,
    visibilityTime: 4000,
  })
}
