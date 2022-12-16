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

  const [accountLimits, setAccountLimits] = React.useState<accountLimitsData[]>(null)

  const withdrawalLimitsRef = React.useRef<accountLimitPeriod>(null)
  const internalSendLimitsRef = React.useRef<accountLimitPeriod>(null)
  const convertLimitsRef = React.useRef<accountLimitPeriod>(null)

  if (error) {
    crashlytics().recordError(error)
  }

  React.useEffect(() => {
    if (data) setAccountLimits([limits])
  }, [data, limits])

  React.useMemo(
    () =>
      accountLimits?.map((data) => {
        withdrawalLimitsRef.current = data.withdrawal.reduce(
          (prev, curr) => ({ ...prev, [curr.__typename]: curr }),
          {},
        )
        internalSendLimitsRef.current = data.internalSend.reduce(
          (prev, curr) => ({ ...prev, [curr.__typename]: curr }),
          {},
        )
        convertLimitsRef.current = data.convert.reduce(
          (prev, curr) => ({ ...prev, [curr.__typename]: curr }),
          {},
        )
        return { withdrawalLimitsRef, internalSendLimitsRef, convertLimitsRef }
      }),
    [accountLimits],
  )

  const withdrawalLimits: Readonly<accountLimitPeriod> = withdrawalLimitsRef.current
  const internalSendLimits: Readonly<accountLimitPeriod> = internalSendLimitsRef.current
  const convertLimits: Readonly<accountLimitPeriod> = convertLimitsRef.current

  return {
    withdrawalLimits,
    internalSendLimits,
    convertLimits,
    loading,
    error,
    refetch,
  }
}
