import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { PersistentStateWrapper, StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import SendBitcoinConfirmationScreen from "./send-bitcoin-confirmation-screen"
import * as PaymentDetails from "./payment-details/intraledger"
import mocks from "../../graphql/mocks"
import { WalletCurrency } from "../../graphql/generated"
import { ConvertMoneyAmount } from "../receive-bitcoin-screen/payment-requests/index.types"
import { palette } from "@app/theme"
import { View, StyleSheet } from "react-native"

const Styles = StyleSheet.create({
  sbView: {
    backgroundColor: palette.culturedWhite,
    height: "100%",
  },
})

export default {
  title: "SendBitcoinConfirmationScreen",
  component: SendBitcoinConfirmationScreen,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <PersistentStateWrapper>
          <MockedProvider mocks={mocks} cache={createCache()}>
            <StoryScreen>
              <View style={Styles.sbView}>{Story()}</View>
            </StoryScreen>
          </MockedProvider>
        </PersistentStateWrapper>
      </IsAuthedContextProvider>
    ),
  ],
} as ComponentMeta<typeof SendBitcoinConfirmationScreen>

const btcSendingWalletDescriptor = {
  currency: WalletCurrency.Usd,
  id: "testwallet",
}

const convertMoneyAmountMock: ConvertMoneyAmount = (amount, currency) => {
  return {
    amount: amount.amount,
    currency,
  }
}

const testAmount = {
  amount: 100,
  currency: WalletCurrency.Usd,
}

const defaultParams: PaymentDetails.CreateIntraledgerPaymentDetailsParams<WalletCurrency> =
  {
    handle: "test",
    recipientWalletId: "testid",
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptor,
    unitOfAccountAmount: testAmount,
  }

const { createIntraledgerPaymentDetails } = PaymentDetails
const paymentDetail = createIntraledgerPaymentDetails(defaultParams)

const route = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail,
  },
} as const

export const Intraledger = () => <SendBitcoinConfirmationScreen route={route} />
