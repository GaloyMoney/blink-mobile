import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import {
  clickBackButton,
  clickButton,
  clickIcon,
  waitTillOnHomeScreen,
  waitTillTextDisplayed,
  checkContact,
  selector,
  addSmallAmount,
} from "./utils"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Validate Username Flow", () => {
  const username = "unclesamtoshi"
  const lnAddress = "unclesamtoshi@pay.staging.galoy.io"

  it("Click Send", async () => {
    await clickIcon(LL.HomeScreen.send())
  })

  it("Paste Username", async () => {
    const usernameInput = await $(
      selector(LL.SendBitcoinScreen.placeholder(), "Other", "[1]"),
    )
    await usernameInput.waitForDisplayed({ timeout })
    await usernameInput.click()
    await usernameInput.setValue(username)
    await clickButton(LL.common.next())
  })

  it("Confirm Username", async () => {
    // Some kind of bug with the component
    const selectorValue =
      process.env.E2E_DEVICE === "ios"
        ? `${LL.SendBitcoinDestinationScreen.confirmModal.checkBox({
            lnAddress,
          })} ${LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress })}`
        : LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress })
    const checkBoxButton = await $(selector(selectorValue, "Other"))
    await checkBoxButton.waitForEnabled({ timeout })
    await checkBoxButton.click()

    const { isContactAvailable } = await checkContact(username)
    expect(isContactAvailable).toBe(false)

    await clickButton(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton())
    await waitTillTextDisplayed(LL.SendBitcoinScreen.amount())
    await clickBackButton()
    await waitTillTextDisplayed(LL.SendBitcoinScreen.destination())
  })

  it("Go back home", async () => {
    await clickBackButton()
    await waitTillOnHomeScreen()
  })
})

describe("Username Payment Flow", () => {
  const username = "galoytest"

  it("Click Send", async () => {
    await clickIcon(LL.HomeScreen.send())
  })

  it("Paste Username", async () => {
    const usernameInput = await $(
      selector(LL.SendBitcoinScreen.placeholder(), "Other", "[1]"),
    )
    await usernameInput.waitForDisplayed({ timeout })
    await usernameInput.click()
    await usernameInput.setValue(username)
  })

  it("Click Next", async () => {
    const { isContactAvailable } = await checkContact(username)
    expect(isContactAvailable).toBeTruthy()

    await clickButton(LL.common.next())
  })

  it("Wallet contains balances", async () => {
    const btcWalletBalance = await $(selector("BTC Wallet Balance", "StaticText"))
    await btcWalletBalance.waitForDisplayed({ timeout })
    expect(btcWalletBalance).toBeDisplayed()
    const btcWalletBalanceInUsdValue = await btcWalletBalance.getText()
    expect(btcWalletBalanceInUsdValue).toHaveText(
      new RegExp(
        "^\\$\\d{1,3}(,\\d{3})*(\\.\\d{1,2})?\\s\\(\\d{1,3}(,\\d{3})*\\ssats\\)$",
      ),
    )
  })

  it("Add amount", async () => {
    await addSmallAmount(LL)
  })

  it("Click Next again", async () => {
    await clickButton(LL.common.next())
  })

  it("Click 'Confirm Payment' and get Green Checkmark success", async () => {
    await clickButton(LL.SendBitcoinConfirmationScreen.title())
    await waitTillOnHomeScreen()
  })
})

describe("Conversion Flow", () => {
  if (process.env.E2E_DEVICE === "ios") {
    return
  }

  it("Click on Transfer Button", async () => {
    await clickIcon(LL.ConversionDetailsScreen.title())
  })

  it("Add amount", async () => {
    await addSmallAmount(LL)
  })

  it("Click Next", async () => {
    await clickButton(LL.common.next())
  })

  it("Click on Convert", async () => {
    await clickButton(LL.common.convert())
  })

  it("Get Green Checkmark Success Icon and Navigate to HomeScreen", async () => {
    await waitTillOnHomeScreen()
  })
})
