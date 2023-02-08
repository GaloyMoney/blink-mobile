import { i18nObject } from "../app/i18n/i18n-util"
import { loadLocale } from "../app/i18n/i18n-util.sync"
import { selector, enter } from "./utils"
import { checkContact } from "./utils/graphql"

describe("Username Payment Flow", () => {
  loadLocale("en")
  const LL = i18nObject("en")
  const timeout = 30000
  const username = "test"
  const lnAddress = "test@pay.staging.galoy.io"

  it("Click Send", async () => {
    const sendButton = await $(selector(LL.HomeScreen.send(), "Other"))
    await sendButton.waitForDisplayed({ timeout })
    await sendButton.click()
  })

  it("Paste Username", async () => {
    try {
      const usernameInput = await $(
        selector(LL.SendBitcoinScreen.input(), "Other", "[1]"),
      )
      await usernameInput.waitForDisplayed({ timeout })
      await usernameInput.click()
      await usernameInput.setValue(username)
    } catch (err) {
      console.error(err)
    }
  })

  it("Click Next", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
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
    if (!isContactAvailable) {
      if ((await checkBoxButton.isDisplayed()) || (await confirmButton.isEnabled())) {
        await checkBoxButton.click()
        await confirmButton.isEnabled()
        await confirmButton.click()
      }
    }
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Wallet contains balances", async () => {
    const btcWalletBalanceInUsd = await $(
      selector("BTC Wallet Balance in USD", "StaticText"),
    )
    await expect(btcWalletBalanceInUsd).toBeDisplayed()
    const btcWalletBalanceInUsdValue = await btcWalletBalanceInUsd.getText()
    expect(btcWalletBalanceInUsdValue).toHaveText(
      new RegExp("^$(0|[1-9][0-9]{0,2})(,d{3})*(.d{1,2})?$"),
    )
    const btcWalletBalanceInSats = await $(
      selector("BTC Wallet Balance in sats", "StaticText"),
    )
    await expect(btcWalletBalanceInSats).toBeDisplayed()
    const btcWalletBalanceInSatsValue = await btcWalletBalanceInSats.getText()
    expect(btcWalletBalanceInSatsValue).toHaveText(new RegExp("^[0-9,]* sats$"))
  })

  it("Add amount", async () => {
    try {
      const amountInput = await $(selector("USD Amount", "TextField"))
      await amountInput.waitForDisplayed({ timeout })
      await amountInput.click()
      await amountInput.setValue("2")
      await enter(amountInput)
    } catch (e) {
      console.error(e)
    }
  })

  it("Click Next again", async () => {
    const nextButton = await $(selector(LL.common.next(), "Button"))
    await nextButton.waitForDisplayed({ timeout })
    await nextButton.isEnabled()
    await nextButton.click()
  })

  it("Click 'Confirm Payment' and get Green Checkmark success", async () => {
    const confirmPaymentButton = await $(
      selector(LL.SendBitcoinConfirmationScreen.title(), "Button"),
    )
    await confirmPaymentButton.waitForDisplayed({ timeout })
    await confirmPaymentButton.click()
    const currentBalanceHeader = await $(selector("Current Balance Header", "StaticText"))
    // Wait 10 seconds for move money screen to be displayed
    await currentBalanceHeader.waitForDisplayed({ timeout: 10000 })
  })
})
