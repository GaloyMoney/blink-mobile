/* eslint-disable no-param-reassign */

// refactor these utils
export const sameDay = (d1: number, d2: number | Date): boolean => {
  const parsed_d1 = new Date(1000 * d1) // XXX FIXME

  if (typeof d2 === "number") {
    d2 = new Date(d2)
  }

  return (
    parsed_d1.getFullYear() === d2.getFullYear() &&
    parsed_d1.getMonth() === d2.getMonth() &&
    parsed_d1.getDate() === d2.getDate()
  )
}

export const sameMonth = (d1: number, d2: number | Date): boolean => {
  const parsed_d1 = new Date(1000 * d1) // XXX FIXME

  if (typeof d2 === "number") {
    d2 = new Date(d2)
  }

  return (
    parsed_d1.getFullYear() === d2.getFullYear() && parsed_d1.getMonth() === d2.getMonth()
  )
}

export const unixTime = (): number => Math.floor(Date.now() / 1000)
