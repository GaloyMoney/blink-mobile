import { readTranslationFromDisk } from "typesafe-i18n/exporter"
import fs from "fs"
import { BaseTranslation } from "typesafe-i18n"

const DEFAULT_RAW_EXPORT_PATH = `${__dirname}/../app/i18n/raw-i18n`

const writeToFile = async (
  translation: BaseTranslation,
  locale: string,
  directory: string,
) => {
  const filePath = `${directory}/${locale}.json`
  const data = JSON.stringify(translation, null, 4) + "\n"
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error(err)
      throw err
    }
  })
}

const exportTranslationsForLocale = async (
  locale: string,
  directory: string,
): Promise<boolean> => {
  const mapping = await readTranslationFromDisk(locale)
  const translation = Array.isArray(mapping.translations)
    ? mapping.translations[0]
    : mapping.translations
  if (translation) {
    await writeToFile(translation, locale, directory)
    return true
  }
  return false
}

const locale = process.argv[2] || "en"
const fallbackExportDirectory =
  locale === "en"
    ? `${DEFAULT_RAW_EXPORT_PATH}/source`
    : `${DEFAULT_RAW_EXPORT_PATH}/translations`
const exportDirectory = process.argv[3] || fallbackExportDirectory

exportTranslationsForLocale(locale, exportDirectory)
