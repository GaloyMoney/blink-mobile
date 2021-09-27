export function parseTimer(seconds: number): string {
  if (!seconds) {
    return "00:00"
  }
  const min = parseInt(String(seconds / 60)).toString()
  const sec = parseInt(String(seconds % 60)).toString()
  const minute = parseInt(min) < 10 ? `0${min}` : min
  const second = parseInt(sec) < 10 ? `0${sec}` : sec
  return `${minute}:${second}`
}

// this function is used to compute correct time spent
export function computeCount(startTime: Date): number {
  const oldMin = startTime.getMinutes()
  const oldSec = startTime.getSeconds()
  const newMin = new Date().getMinutes()
  const newSec = new Date().getSeconds()
  if (oldMin === newMin) {
    return 60 - (newSec - oldSec)
  } else if (newMin - oldMin === 1) {
    return 61 - (60 - oldSec + newSec)
  } else {
    return 0
  }
}
