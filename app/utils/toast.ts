import Toast from "react-native-toast-message"
import { i18nObject } from "@app/i18n/i18n-util"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { logToastShown } from "./analytics"

export const toastShow = ({
  message,
  currentTranslation,
  onHide,
  type = "error",
  autoHide,
  position = "bottom",
}: {
  message: ((translations: TranslationFunctions) => string) | string
  currentTranslation?: TranslationFunctions
  onHide?: () => void
  type?: "error" | "success" | "warning"
  autoHide?: boolean
  position?: "top" | "bottom"
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

  // FIXME: Toast might not be shown if there is a modal already,
  // like in the case of the quiz rewards questions
  //
  // a potential solution:
  // https://github.com/calintamas/react-native-toast-message/issues/164#issuecomment-803556361
  Toast.show({
    type,
    text1: type === "error" ? translations.common.error() : translations.common.success(),
    text2: translatedMessage,
    position,
    onHide,
    visibilityTime: 10000,
    autoHide,
  })
}
