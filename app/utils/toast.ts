import Toast from "react-native-toast-message"
import { i18nObject } from "@app/i18n/i18n-util"
import { TranslationFunctions } from "@app/i18n/i18n-types"
import { logToastShown } from "./analytics"

export const toastShow = ({
  message,
  LL,
  onHide,
  type = "error",
  autoHide,
}: {
  message: ((translations: TranslationFunctions) => string) | string
  LL: TranslationFunctions
  onHide?: () => void
  type?: "error" | "success" | "warning"
  autoHide?: boolean
}): void => {
  const englishTranslation = i18nObject("en")
  const englishMessage =
    typeof message === "function" ? message(englishTranslation) : message
  const translatedMessage = typeof message === "function" ? message(LL) : message

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
    text1: type === "error" ? LL.common.error() : LL.common.success(),
    text2: translatedMessage,
    position: "bottom",
    bottomOffset: 80,
    onHide,
    visibilityTime: 4000,
    autoHide,
  })
}
