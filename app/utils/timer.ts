export function parseTimer(seconds: number): string {
  if (!seconds) {
    return "00:00"
  }
  const minute = parseInt(String(seconds / 60))
  const second = parseInt(String(seconds % 60))
  return `${minute.toString().padStart(2, "0")}:${
    second > 0 ? second.toString().padStart(2, "0") : "00"
  }`
}
