import { gql, useSubscription } from "@apollo/client"

const PRICE_SUBSCRIPTION = gql`
  subscription ($input: PriceInput!) {
    price(input: $input) {
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
      errors {
        message
      }
    }
  }
`

export const usePriceSubscription = (onPriceChange: (price: number) => void) => {
  useSubscription(PRICE_SUBSCRIPTION, {
    variables: {
      input: {
        amount: 1,
        amountCurrencyUnit: "BTCSAT",
        priceCurrencyUnit: "USDCENT",
      },
    },
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.price?.price?.formattedAmount) {
        onPriceChange(subscriptionData.data.price.price.formattedAmount)
      }
    },
  })
}
