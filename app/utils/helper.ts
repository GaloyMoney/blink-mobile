import { NativeModules, Platform } from "react-native"

export const emailIsValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffle = <Type>(array: Type[]): Type[] => {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export const scriptHostname = (): string => {
  const { scriptURL } = NativeModules.SourceCode
  const scriptHostname = scriptURL?.split("://")[1].split(":")[0] ?? ""
  return scriptHostname
}

export const isIos = Platform.OS === "ios"

export const getLocation = (location: { lat?: any, long?: any }) => {
  if (!location || !location?.lat || !location?.long) return ''
  return `Lat: ${location.lat}, Long: ${location.long}`
}