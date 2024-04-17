/* eslint-disable no-param-reassign */

export const DEC_1_12_AM_UTC_MINUS_6 = new Date(Date.UTC(2023, 11, 1, 6, 0, 0)).getTime()

export const JAN_1_2024_12_AM_UTC_MINUS_6 = new Date(
  Date.UTC(2024, 0, 1, 6, 0, 0),
).getTime()

export const FEB_1_2024_12_AM_UTC_MINUS_6 = new Date(
  Date.UTC(2024, 1, 1, 6, 0, 0),
).getTime()

export const MAR_1_2024_12_AM_UTC_MINUS_6 = new Date(
  Date.UTC(2024, 2, 1, 6, 0, 0),
).getTime()

export const APR_1_2024_12_AM_UTC_MINUS_6 = new Date(
  Date.UTC(2024, 3, 1, 6, 0, 0),
).getTime()

export const MAY_1_2024_12_AM_UTC_MINUS_6 = new Date(
  Date.UTC(2024, 4, 1, 6, 0, 0),
).getTime()

export const JUNE_1_2024_12_AM_UTC_MINUS_6 = new Date(
  Date.UTC(2024, 5, 1, 6, 0, 0),
).getTime()

const secondsToDDMMSS = (totalSeconds: number) => {
  if (totalSeconds < 0) return ""

  const days = Math.floor(totalSeconds / 86400) // There are 86400 seconds in a day
  const hours = Math.floor((totalSeconds - days * 86400) / 3600) // 3600 seconds in an hour
  const minutes = Math.floor((totalSeconds - days * 86400 - hours * 3600) / 60)
  const seconds = Math.floor(totalSeconds - days * 86400 - hours * 3600 - minutes * 60)

  const formattedDays = days.toString().padStart(2, "0")
  const formattedHours = hours.toString().padStart(2, "0")
  const formattedMinutes = minutes.toString().padStart(2, "0")
  const formattedSeconds = seconds.toString().padStart(2, "0")

  return `${formattedDays}:${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}

export const getTimeLeft = ({ after, until }: { after: number; until: number }) => {
  const dateNow = Date.now()
  if (dateNow > until || dateNow < after) return ""

  const sLeft = (until - dateNow) / 1000
  return secondsToDDMMSS(sLeft)
}
