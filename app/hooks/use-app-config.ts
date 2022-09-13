import { usePersistentStateContext } from "@app/store/persistent-state"
import { useCallback, useMemo } from "react"

export type AppConfiguration = {
  isUsdDisabled: boolean
}

export const useAppConfig = () => {
  const persistentStateContext = usePersistentStateContext()

  const appConfig = useMemo(() => {
    return {
      isUsdDisabled: persistentStateContext.persistentState.isUsdDisabled,
    }
  }, [persistentStateContext.persistentState])

  const toggleUsdDisabled = useCallback(() => {
    persistentStateContext.updateState((state) => ({
      ...state,
      isUsdDisabled: !state.isUsdDisabled,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistentStateContext.updateState])

  return { appConfig, toggleUsdDisabled }
}
