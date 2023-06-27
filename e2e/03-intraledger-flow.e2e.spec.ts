import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, addSmallAmount } from "./utils"
import {
  clickBackButton,
  clickGaloyButton,
  clickIconButton,
  waitTillOnHomeScreen,
} from "./utils/components"
import { checkContact } from "./utils/graphql"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Validate Username Flow", () => {
  const username = "unclesamtoshi"
  const lnAddress = "unclesamtoshi@pay.staging.galoy.io"

  it("Click Send", async () => {
    await clickIconButton(LL.HomeScreen.send())
  })

  it("Paste Username", async () => {
    const usernameInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
    await usernameInput.waitForDisplayed({ timeout })
    await usernameInput.click()
    await usernameInput.setValue(username)
    await clickGaloyButton(LL.common.next())
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

    await clickGaloyButton(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton())
  })

  it("Go back to Send Bitcoin Destination Screen", async () => {
    await clickBackButton()
    // TODO need a way to wait till this has happened
  })

  it("Go back home", async () => {
    await clickBackButton()
    await waitTillOnHomeScreen()
  })
})

describe("Username Payment Flow", () => {
  const username = "galoytest"

  it("Click Send", async () => {
    await clickIconButton(LL.HomeScreen.send())
  })

  it("Paste Username", async () => {
    const usernameInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
    await usernameInput.waitForDisplayed({ timeout })
    await usernameInput.click()
    await usernameInput.setValue(username)
  })

  it("Click Next", async () => {
    const { isContactAvailable } = await checkContact(username)
    expect(isContactAvailable).toBeTruthy()

    await clickGaloyButton(LL.common.next())
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
    await clickGaloyButton(LL.common.next())
  })

  it("Click 'Confirm Payment' and get Green Checkmark success", async () => {
    await clickGaloyButton(LL.SendBitcoinConfirmationScreen.title())
    await waitTillOnHomeScreen()
  })
})

describe("Conversion Flow", () => {
  if (process.env.E2E_DEVICE === "ios") {
    return
  }

  it("Click on Transfer Button", async () => {
    await clickIconButton(LL.ConversionDetailsScreen.title())
  })

  it("Add amount", async () => {
    await addSmallAmount(LL)
  })

  it("Click Next", async () => {
    await clickGaloyButton(LL.common.next())
  })

  it("Click on Convert", async () => {
    await clickGaloyButton(LL.common.convert())
  })

  it("Get Green Checkmark Success Icon and Navigate to HomeScreen", async () => {
    await waitTillOnHomeScreen()
  })
})
