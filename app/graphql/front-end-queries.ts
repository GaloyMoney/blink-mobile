import { gql } from "@apollo/client"

gql`
  query homeAuthed {
    me {
      id
      language
      username
      phone
      email {
        address
        verified
      }
      npub

      defaultAccount {
        id
        level
        defaultWalletId

        transactions(first: 20) {
          ...TransactionList
        }
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  query homeUnauthed {
    globals {
      network
    }

    currencyList {
      id
      flag
      name
      symbol
      fractionDigits
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

  query balanceHeader {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  query setDefaultAccountModal {
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

  query conversionScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  query walletCSVTransactions($walletIds: [WalletId!]!) {
    me {
      id
      defaultAccount {
        id
        csvTransactions(walletIds: $walletIds)
      }
    }
  }

  query walletOverviewScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  query sendBitcoinDestination {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
        }
      }
      contacts {
        id
        username
      }
    }
  }

  query accountDefaultWallet($username: Username!) {
    accountDefaultWallet(username: $username) {
      id
    }
  }

  query sendBitcoinDetailsScreen {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        defaultWalletId
        wallets {
          id
          walletCurrency
          balance
        }
      }
    }
  }

  query sendBitcoinWithdrawalLimits {
    me {
      id
      defaultAccount {
        id
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }

  query sendBitcoinInternalLimits {
    me {
      id
      defaultAccount {
        id
        limits {
          internalSend {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }

  query sendBitcoinConfirmationScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
  query myUserId {
    me {
      id
    }
  }
`
export const RealtimePrice = gql`
  query realtimePriceInitial($currency: DisplayCurrency!) {
    realtimePrice(currency: $currency) {
      timestamp
      btcSatPrice {
        base
        offset
      }
      usdCentPrice {
        base
        offset
      }
      denominatorCurrency
    }
  }
`
