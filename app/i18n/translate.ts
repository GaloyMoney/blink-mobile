import i18n from "i18n-js"
import type { QuizSectionContent } from "../types/quiz"

/**
 * Translates text.
 *
 * @param key The i18n key.
 */
export function translate(key: string, options?: Record<string, unknown>): string {
  return key ? i18n.t(key, options) : null
}

export function translateQuizSections(
  key: string,
  options?: Record<string, unknown>,
): string | QuizSectionContent[] {
  return key ? i18n.t(key, options) : null
}
