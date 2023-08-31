import { loadLocale } from "../app/i18n/i18n-util.sync"
import { clickBackButton, getAccountId, adminSendPushNotification } from "./utils"

describe("Push Notification", () => {
  loadLocale("en")

  it("Send Push Notification", async () => {
    const accountId = await getAccountId()
    if (accountId) {
      await adminSendPushNotification(accountId)
    }
  })

  it("Go home", async () => {
    await clickBackButton()
    await clickBackButton()
  })
})
