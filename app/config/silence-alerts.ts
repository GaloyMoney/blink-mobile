import { LogBox } from "react-native"

const logsToSilence: [string | RegExp] = [
  // This log is a warn coming from react-navigation which sometimes causes test failures locally
  // https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
  // We are currently passing in functions as navigation params in the send flow
  "Non-serializable values were found in the navigation state",
]

export default () => {
  LogBox.ignoreLogs(logsToSilence)
}
