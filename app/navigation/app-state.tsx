import { useApolloClient } from "@apollo/client"
import { HomeAuthedDocument } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { logEnterBackground, logEnterForeground } from "@app/utils/analytics"
import React, { useCallback, useEffect } from "react"
import { AppState, AppStateStatus } from "react-native"

export const AppStateWrapper: React.FC = () => {
  const isAuthed = useIsAuthed()
  const appState = React.useRef(AppState.currentState)
  const client = useApolloClient()

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/background/) && nextAppState === "active") {
        isAuthed && client.refetchQueries({ include: [HomeAuthedDocument] })

        console.info("App has come to the foreground!")
        logEnterForeground()
      }

      if (appState.current.match(/active/) && nextAppState === "background") {
        logEnterBackground()
      }

      appState.current = nextAppState
    },
    [client, isAuthed],
  )

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
  }, [handleAppStateChange])

  return <></>
}
