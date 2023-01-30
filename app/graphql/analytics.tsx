import analytics from "@react-native-firebase/analytics"
import { useRootStackQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useEffect } from "react"
import useToken from "@app/hooks/use-token"

gql`
  query rootStack($hasToken: Boolean!) {
    me @include(if: $hasToken) {
      username
      id
    }
    globals {
      network
    }
  }
`

export const AnalyticsContainer = () => {
  const { hasToken } = useToken()

  const { data } = useRootStackQuery({
    variables: { hasToken },
    fetchPolicy: "cache-first",
  })

  useEffect(() => {
    analytics().setUserProperty("hasUsername", data?.me?.username ? "true" : "false")
  }, [data?.me?.username])

  useEffect(() => {
    if (data?.me?.id) {
      analytics().setUserId(data?.me?.id)
    }
  }, [data?.me?.id])

  useEffect(() => {
    if (data?.globals?.network) {
      analytics().setUserProperties({ network: data.globals.network })
    }
  }, [data?.globals?.network])

  return null
}
