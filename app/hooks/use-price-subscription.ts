import { gql, useSubscription } from "@apollo/client"

const PRICE_SUBSCRIPTION = gql`
  subscription priceUpdates {
    myUpdates {
      update {
        type: __typename
        ... on Price {
          base
          offset
          currencyUnit
          formattedAmount
        }
        ... on LnUpdate {
          paymentHash
          status
        }
        ... on OnChainUpdate {
          txNotificationType
          txHash
          amount
          usdPerSat
        }
        ... on IntraLedgerUpdate {
          txNotificationType
          amount
          usdPerSat
        }
      }
    }
  }
`

export const usePriceSubscription = (onPriceChange: (price: number) => void) => {
  useSubscription(PRICE_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.myUpdates?.update?.type === "Price") {
        const { base, offset } = subscriptionData.data.myUpdates.update
        onPriceChange(base / 10 ** offset)
      }
    },
  })
}
