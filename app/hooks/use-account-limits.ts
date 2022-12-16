import * as React from "react"

import { ApolloError, ApolloQueryResult, gql, useQuery } from "@apollo/client"
import crashlytics from "@react-native-firebase/crashlytics"

const ACCOUNT_LIMITS_QUERY = gql`
  query me {
    me {
      defaultAccount {
        limits {
          withdrawal {
            __typename
            totalLimit
            remainingLimit
          }
          internalSend {
            __typename
            totalLimit
            remainingLimit
          }
          convert {
            __typename
            totalLimit
            remainingLimit
          }
        }
      }
    }
  }
`

type limitValue = {
  __typename: string
  remainingLimit: string
  totalLimit: string
}

type accountLimitsData = {
  withdrawal: limitValue[]
  internalSend: limitValue[]
  convert: limitValue[]
}

type accountLimitPeriod = {
  DailyAccountLimit?: limitValue
  WeeklyAccountLimit?: limitValue
}

type useAccountLimitsOutput = {
  withdrawalLimits: Readonly<accountLimitPeriod>
  internalSendLimits: Readonly<accountLimitPeriod>
  convertLimits: Readonly<accountLimitPeriod>
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

  const withdrawalLimits: Readonly<accountLimitPeriod> = limits?.withdrawal.reduce(
    (prev, curr) => ({ ...prev, [curr.__typename]: curr }),
    {},
  )
  const internalSendLimits: Readonly<accountLimitPeriod> = limits?.withdrawal.reduce(
    (prev, curr) => ({ ...prev, [curr.__typename]: curr }),
    {},
  )
  const convertLimits: Readonly<accountLimitPeriod> = limits?.withdrawal.reduce(
    (prev, curr) => ({ ...prev, [curr.__typename]: curr }),
    {},
  )

  return {
    withdrawalLimits,
    internalSendLimits,
    convertLimits,
    loading,
    error,
    refetch,
  }
}
