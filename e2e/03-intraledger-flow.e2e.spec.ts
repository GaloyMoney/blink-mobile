import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, goBack, addSmallAmount } from "./utils"
import { checkContact } from "./utils/graphql"

loadLocale("en")
const LL = i18nObject("en")
const timeout = 30000

describe("Validate Username Flow", () => {
  const username = "unclesamtoshi"
  const lnAddress = "unclesamtoshi@pay.staging.galoy.io"

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Paste Username", async () => {
    const usernameInput = await $(selector(LL.SendBitcoinScreen.input(), "Other", "[1]"))
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await usernameInput.waitForDisplayed({ timeout })
    await usernameInput.click()
    await usernameInput.setValue(username)
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.waitForEnabled()
    await nextButton.click()
  })

  it("Confirm Username", async () => {
    const checkBoxButton = await $(
      selector(
        LL.SendBitcoinDestinationScreen.confirmModal.checkBox({ lnAddress }),
        "Other",
      ),
    )
    const confirmButton = await $(
      selector(LL.SendBitcoinDestinationScreen.confirmModal.confirmButton(), "Button"),
    )
    const { isContactAvailable } = await checkContact(username)
    expect(isContactAvailable).toBe(false)

    await checkBoxButton.waitForDisplayed({ timeout })
    await checkBoxButton.click()
    await confirmButton.waitForEnabled({ timeout })
    await confirmButton.click()
  })

  it("Go back to Send Bitcoin Destination Screen", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
    await browser.pause(2000)
  })

  it("Go back home", async () => {
    const backHomeButton = await $(goBack())
    await backHomeButton.waitForDisplayed({ timeout })
    await backHomeButton.click()
  })
})

describe("Username Payment Flow", () => {
  const username = "galoytest"

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
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
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.waitForEnabled()
    await nextButton.click()
  })

  it("Wallet contains balances", async () => {
    const btcWalletBalance = await $(selector("BTC Wallet Balance", "StaticText"))
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
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.waitForEnabled()
    await nextButton.click()
  })

  it("Click 'Confirm Payment' and get Green Checkmark success", async () => {
    const confirmPaymentButton = await $(
      selector(LL.SendBitcoinConfirmationScreen.title(), "Button"),
    )
    await confirmPaymentButton.waitForDisplayed({ timeout })
    await confirmPaymentButton.click()
    const currentBalanceHeader = await $(
      selector(LL.HomeScreen.myAccounts(), "StaticText"),
    )
    await currentBalanceHeader.waitForDisplayed({ timeout })
  })
})

describe("Conversion Flow", () => {
  it("Click on Transfer Button", async () => {
    const transferButton = await $(selector(LL.ConversionDetailsScreen.title(), "Other"))
    await transferButton.waitForDisplayed({ timeout })
    await transferButton.click()
  })

  it("Add amount", async () => {
    await addSmallAmount(LL)
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.waitForEnabled()
    await nextButton.click()
  })

  it("Click on Convert", async () => {
    const convertButton = await $(selector(LL.common.convert(), "Button"))
    await convertButton.waitForDisplayed({ timeout })
    await convertButton.waitForEnabled()
    await convertButton.click()
  })

  it("Get Green Checkmark Success Icon and Navigate to HomeScreen", async () => {
    const currentBalanceHeader = await $(
      selector(LL.HomeScreen.myAccounts(), "StaticText"),
    )
    await currentBalanceHeader.waitForDisplayed({ timeout })
  })
})
