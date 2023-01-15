import { gql } from "@apollo/client"
import Fragments from "./fragments"

export default gql`
  query transactionListForContact(
    $username: Username!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      contactByUsername(username: $username) {
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }

  query transactionListForDefaultAccount(
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      defaultAccount {
        id
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }

  query onChainTxFee(
    $walletId: WalletId!
    $address: OnChainAddress!
    $amount: SatAmount!
    $targetConfirmations: TargetConfirmations
  ) {
    onChainTxFee(
      walletId: $walletId
      address: $address
      amount: $amount
      targetConfirmations: $targetConfirmations
    ) {
      amount
      targetConfirmations
    }
  }

  query accountLimits {
    me {
      defaultAccount {
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
          }
          internalSend {
            totalLimit
            remainingLimit
            interval
          }
          convert {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }

  query mainQuery($hasToken: Boolean!) {
    globals {
      nodesIds
      network
    }

    # TODO: remove from main query
    quizQuestions {
      id
      earnAmount
    }
    # END TODO

    btcPrice {
      base
      offset
      currencyUnit
      formattedAmount
    }
    me @include(if: $hasToken) {
      id
      language
      username
      phone

      # TODO: remove from main query
      quizQuestions {
        question {
          id
          earnAmount
        }
        completed
      }
      # END TODO

      contacts {
        id
        username
        alias
        transactionsCount
      }
      defaultAccount {
        id
        defaultWalletId
        transactions(first: 3) {
          ...TransactionList
        }
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
    mobileVersions {
      platform
      currentSupported
      minSupported
    }
  }

  query initWallet {
    me {
      id
      defaultAccount {
        id
        defaultWalletId
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  # test only. could be in a dedicated file
  query wallets {
    me {
      defaultAccount {
        wallets {
          walletCurrency
          id
        }
      }
    }
  }

  ${Fragments}
`
