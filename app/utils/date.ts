export const sameDay = (d1, d2) => {
  if (typeof d2 === "number") {
    d2 = new Date(d2)
  }

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export const sameMonth = (d1, d2) => {
  if (typeof d2 === "number") {
    d2 = new Date(d2)
  }

  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
}

/**
 * Parse a unix time stamp to a JavaScript date object
 * @param  {number} timeStamp The unix time stamp in seconds
 * @return {Date}             The date object
 */
export const parseDate = timeStamp => {
  if (!Number.isInteger(timeStamp)) {
    throw new Error("Invalid input!")
  }
  return new Date(timeStamp * 1000)
}
