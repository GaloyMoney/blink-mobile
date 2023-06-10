/* eslint-disable no-param-reassign */

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
