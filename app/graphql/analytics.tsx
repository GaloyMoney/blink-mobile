import analytics from "@react-native-firebase/analytics"
import { useAnalyticsQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useEffect } from "react"
import { useIsAuthed } from "./is-authed-context"
import { useLevel } from "./level-context"
import { useAppConfig } from "@app/hooks"

gql`
  query analytics {
    me {
      username
      id
    }
    globals {
      network
    }
  }
`

export const AnalyticsContainer = () => {
  const isAuthed = useIsAuthed()
  const level = useLevel()
  const {
    appConfig: {
      galoyInstance: { name: galoyInstanceName },
    },
  } = useAppConfig()

  const { data } = useAnalyticsQuery({
    skip: !isAuthed,
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

  useEffect(() => {
    analytics().setUserProperty("accountLevel", level.currentLevel)
  }, [level])

  useEffect(() => {
    analytics().setUserProperty("galoyInstance", galoyInstanceName)
  }, [galoyInstanceName])

  return null
}
