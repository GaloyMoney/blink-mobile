import * as React from "react"

import { ApolloError, ApolloQueryResult, gql, useQuery } from "@apollo/client"
import crashlytics from "@react-native-firebase/crashlytics"

const ACCOUNT_LIMITS_QUERY = gql`
  query me {
    me {
      defaultAccount {
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
            __typename
          }
          internalSend {
            totalLimit
            remainingLimit
            interval
            __typename
          }
          convert {
            totalLimit
            remainingLimit
            interval
            __typename
          }
        }
      }
    }
  }
`

export type limitValue = {
  __typename: string
  remainingLimit: string
  totalLimit: string
  interval: string
}

export type accountLimitsData = {
  withdrawal: limitValue[]
  internalSend: limitValue[]
  convert: limitValue[]
}

type useAccountLimitsOutput = {
  limits: accountLimitsData
  loading: boolean
  error: ApolloError
  refetch: () => Promise<ApolloQueryResult<unknown>>
}

export const useAccountLimitsQuery = (): useAccountLimitsOutput => {
  const { data, loading, error, refetch } = useQuery(ACCOUNT_LIMITS_QUERY)
  const limits: accountLimitsData = data?.me?.defaultAccount?.limits

  React.useEffect(() => {
    if (error) {
      crashlytics().recordError(error)
    }
  }, [error])

  return {
    limits,
    loading,
    error,
    refetch,
  }
}
