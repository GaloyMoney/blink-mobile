import { MockedProvider } from "@apollo/client/testing"
import { Meta } from "@storybook/react"
import React from "react"
import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import { ConfirmDestinationModal } from "./confirm-destination-modal"
import mocks from "../../graphql/mocks"
import { createIntraLedgerDestination } from "@app/screens/send-bitcoin-screen/payment-destination"

export default {
  title: "ConfirmDestinationModal",
  component: ConfirmDestinationModal,
  decorators: [
    (Story) => (
      <IsAuthedContextProvider value={true}>
        <MockedProvider mocks={mocks} cache={createCache()}>
          <StoryScreen>{Story()}</StoryScreen>
        </MockedProvider>
      </IsAuthedContextProvider>
    ),
  ],
} as Meta<typeof ConfirmDestinationModal>

const createIntraLedgerDestinationParams = {
  parsedIntraledgerDestination: {
    paymentType: "intraledger",
    handle: "testhandle",
  },
  walletId: "testwalletid",
} as const

const intraLedgerDestination = createIntraLedgerDestination(
  createIntraLedgerDestinationParams,
)
intraLedgerDestination.createPaymentDetail

const params = {
  destinationState: {
    unparsedDestination: "user@blink.sv",
    destinationState: "requires-confirmation",
    destination: {
      valid: true,
      validDestination: {
        valid: true,
        paymentType: "intraledger",
        handle: "user@blink.sv",
        walletId: "testid",
      },
      destinationDirection: "Send",
      createPaymentDetail: intraLedgerDestination.createPaymentDetail,
    },
    confirmationType: {
      type: "new-username",
      username: "destination-username",
    },
  },
  dispatchDestinationStateAction: () => {},
} as const

export const Default = () => <ConfirmDestinationModal {...params} />
