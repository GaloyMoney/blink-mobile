import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  clickBackButton,
  getAccountId,
  adminSendPushNotification,
  waitTillTextDisplayed,
} from "./utils"
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"

describe("Push Notification", () => {
  loadLocale("en")

  it("Send Push Notification", async () => {
    const accountId = await getAccountId()
    if (accountId) {
      await adminSendPushNotification(accountId)
      messaging().onMessage(
        async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          const notificationType = remoteMessage.data?.notificationType
          if (notificationType === "InnerCircleGrew") {
            // eslint-disable-next-line no-alert
            alert("InnerCircleGrew")
          }
        },
      )
      waitTillTextDisplayed("InnerCircleGrew")
    }
  })

  it("Go home", async () => {
    await clickBackButton()
    await clickBackButton()
  })
})
