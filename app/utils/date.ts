/* eslint-disable no-param-reassign */

import moment from "moment"

// refactor these utils
export const sameDay = (d1: number, d2: number | Date): boolean => {
  const parsedD1 = new Date(1000 * d1) // XXX FIXME

  if (typeof d2 === "number") {
    d2 = new Date(d2)
  }

  return (
    parsedD1.getFullYear() === d2.getFullYear() &&
    parsedD1.getMonth() === d2.getMonth() &&
    parsedD1.getDate() === d2.getDate()
  )
}

export const sameMonth = (d1: number, d2: number | Date): boolean => {
  const parsedD1 = new Date(1000 * d1) // XXX FIXME

  if (typeof d2 === "number") {
    d2 = new Date(d2)
  }

  return (
    parsedD1.getFullYear() === d2.getFullYear() && parsedD1.getMonth() === d2.getMonth()
  )
}

/**
 * Parse a unix time stamp to a JavaScript date object
 * @param  {number} timeStamp The unix time stamp in seconds
 * @return {Date}             The date object
 */
export const parseDate = (timeStamp: number): Date => {
  if (!Number.isInteger(timeStamp)) {
    throw new Error("Invalid input!")
  }
  return new Date(timeStamp * 1000)
}

export const unixTime = (): number => Math.floor(Date.now() / 1000)

export const toMomentLocale = (locale: string) => {
  const newLocale = locale.replace("_", "-").toLowerCase()
  const tryLocales = [newLocale, newLocale.split("-")[0]]
  return tryLocales.find((element) => moment.locales().includes(element)) || "en"
}
