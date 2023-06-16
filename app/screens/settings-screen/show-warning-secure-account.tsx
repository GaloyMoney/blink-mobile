import { gql } from "@apollo/client"
import { useWarningSecureAccountQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { usePriceConversion } from "@app/hooks"
import {
  ZeroUsdMoneyAmount,
  addMoneyAmounts,
  greaterThanOrEqualTo,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
} from "@app/types/amounts"

gql`
  query warningSecureAccount {
    me {
      id
      defaultAccount {
        level
        id

        # this is necessary for the mock to work properly
        wallets {
          id
          balance
          walletCurrency
        }

        btcWallet @client {
          id
          balance
        }
        usdWallet @client {
          balance
          id
        }
      }
    }
  }
`

const minimumBalance = 500 // $5

export const useShowWarningSecureAccount = () => {
  const { convertMoneyAmount } = usePriceConversion()
  const isAuthed = useIsAuthed()

  const { data } = useWarningSecureAccountQuery({
    fetchPolicy: "cache-only",
    skip: !isAuthed,
  })

  if (data?.me?.defaultAccount.level !== "ZERO") return false

  const usdMoneyAmount = toUsdMoneyAmount(data?.me?.defaultAccount?.usdWallet?.balance)

  const btcMoneyAmount = toBtcMoneyAmount(data?.me?.defaultAccount?.btcWallet?.balance)

  const btcBalanceInUsd =
    (convertMoneyAmount && convertMoneyAmount(btcMoneyAmount, "USD")) ||
    ZeroUsdMoneyAmount

  const totalBalanceUsd = addMoneyAmounts({
    a: btcBalanceInUsd,
    b: usdMoneyAmount,
  })

  return greaterThanOrEqualTo({
    value: totalBalanceUsd,
    greaterThanOrEqualTo: toUsdMoneyAmount(minimumBalance),
  })
}
