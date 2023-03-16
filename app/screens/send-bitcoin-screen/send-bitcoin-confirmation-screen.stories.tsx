import { MockedProvider } from "@apollo/client/testing"
import { ComponentMeta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import SendBitcoinConfirmationScreen from "./send-bitcoin-confirmation-screen"
import * as PaymentDetails from "./payment-details/intraledger"
import * as PaymentDetailsOC from "./payment-details/onchain"
import * as PaymentDetailsLightning from "./payment-details/lightning"
import mocks from "../../graphql/mocks"
import { WalletCurrency } from "../../graphql/generated"
import { ConvertMoneyAmount } from "../receive-bitcoin-screen/payment-requests/index.types"
import { DisplayCurrency, toUsdMoneyAmount } from "@app/types/amounts"
import { palette } from "@app/theme"
import { View, StyleSheet } from "react-native"
import type { RouteProp } from "@react-navigation/core"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { LnUrlPayServiceResponse, Satoshis } from "lnurl-pay/dist/types/types"

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
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>
            <View style={Styles.sbView}>{Story()}</View>
          </StoryScreen>
        </MockedProvider>
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
    currencyCode: currency === DisplayCurrency ? "NGN" : currency,
  }
}

const testAmount = toUsdMoneyAmount(100)

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

const btcSendingWalletDescriptorOC = {
  currency: WalletCurrency.Btc,
  id: "testwallet",
}

const { createAmountOnchainPaymentDetails } = PaymentDetailsOC

const defaultParamsOC: PaymentDetailsOC.CreateAmountOnchainPaymentDetailsParams<WalletCurrency> =
  {
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptorOC,
    address: "superfakebitcoinaddress",
    destinationSpecifiedAmount: {
      amount: 88413,
      currency: WalletCurrency.Btc,
      currencyCode: "BTC",
    },
  }

const paymentDetailOC = createAmountOnchainPaymentDetails(defaultParamsOC)

const onChainRoute: RouteProp<RootStackParamList, "sendBitcoinConfirmation"> = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail: paymentDetailOC,
  },
} as const

export const OnChain = () => <SendBitcoinConfirmationScreen route={onChainRoute} />

const btcSendingWalletDescriptorLightning = {
  currency: WalletCurrency.Btc,
  id: "testwallet",
}

const { createAmountLightningPaymentDetails } = PaymentDetailsLightning

const defaultParamsLightning: PaymentDetailsLightning.CreateAmountLightningPaymentDetailsParams<WalletCurrency> =
  {
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptorLightning,
    paymentRequest: "superfakelighntingpaymentrequestlonglonglong",
    paymentRequestAmount: {
      amount: 88200,
      currency: WalletCurrency.Btc,
      currencyCode: "BTC",
    },
  }

const paymentDetailLightning = createAmountLightningPaymentDetails(defaultParamsLightning)

const lightningRoute: RouteProp<RootStackParamList, "sendBitcoinConfirmation"> = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail: paymentDetailLightning,
  },
} as const

export const Ligntning = () => <SendBitcoinConfirmationScreen route={lightningRoute} />

const btcSendingWalletDescriptorLnUrl = {
  currency: WalletCurrency.Btc,
  id: "testwallet",
}

const { createLnurlPaymentDetails } = PaymentDetailsLightning

const lnurlParams: LnUrlPayServiceResponse = {
  callback: "fakeCallback",
  fixed: true,
  min: 1 as Satoshis,
  max: 100 as Satoshis,
  metadata: [],
  metadataHash: "string",
  identifier: "string",
  description: "string",
  image: "fakeimagestring",
  commentAllowed: 0,
  rawData: {},
}

const defaultParamsLnUrl: PaymentDetailsLightning.CreateLnurlPaymentDetailsParams<WalletCurrency> =
  {
    convertMoneyAmount: convertMoneyAmountMock,
    sendingWalletDescriptor: btcSendingWalletDescriptorLnUrl,
    paymentRequest: "superfakelighntingpaymentrequestlonglonglong",
    paymentRequestAmount: {
      amount: 100,
      currency: WalletCurrency.Btc,
      currencyCode: "BTC",
    },
    lnurl: "superfakelnurl@localhost",
    lnurlParams,
    unitOfAccountAmount: testAmount,
  }

const paymentDetailLnUrl = createLnurlPaymentDetails(defaultParamsLnUrl)

const lnUrlRoute: RouteProp<RootStackParamList, "sendBitcoinConfirmation"> = {
  key: "sendBitcoinConfirmationScreen",
  name: "sendBitcoinConfirmation",
  params: {
    paymentDetail: paymentDetailLnUrl,
  },
} as const

export const LnUrl = () => <SendBitcoinConfirmationScreen route={lnUrlRoute} />
