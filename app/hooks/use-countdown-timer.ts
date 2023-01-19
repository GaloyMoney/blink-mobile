import { useCallback, useEffect, useState } from "react"

type useCountdownTimerReturnValue = {
  timeLeft: number | undefined
  startCountdownTimer: (seconds: number, callback?: () => void) => void
  stopCountdownTimer: () => void
  resetCountdownTimer: (seconds: number, newCallback?: () => void) => void
  resetCountdownTimerAndExecuteExistingCallback: (
    seconds: number,
    newCallback?: () => void,
  ) => void
  clearCountdownTimerAndExecuteCallback: () => void
}

export const useCountdownTimer = (): useCountdownTimerReturnValue => {
  const [timeLeft, setTimeLeft] = useState<number>()
  const [completedCallback, setCompletedCallback] = useState<() => void>()

  useEffect(() => {
    if (timeLeft !== undefined) {
      const interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)

      if (timeLeft === 0) {
        clearInterval(interval)
        if (completedCallback) {
          completedCallback()
        }
      }

      return () => {
        clearInterval(interval)
      }
    }
    // We need to return from all code paths but we only need a callback if an interval is set so returning undefined is fine
    return undefined
  }, [timeLeft, completedCallback, setTimeLeft])

  const startCountdownTimer = useCallback(
    (seconds: number, callback?: () => void) => {
      setTimeLeft(seconds)
      if (callback) {
        setCompletedCallback(() => callback)
      }
    },
    [setTimeLeft, setCompletedCallback],
  )

  const stopCountdownTimer = useCallback(() => {
    setCompletedCallback(undefined)
    setTimeLeft(0)
  }, [setTimeLeft, setCompletedCallback])

  const resetCountdownTimer = useCallback(
    (seconds: number, newCallback?: () => void) => {
      setTimeLeft(seconds)
      if (newCallback) {
        setCompletedCallback(() => newCallback)
      }
    },
    [setTimeLeft, setCompletedCallback],
  )

  const resetCountdownTimerAndExecuteExistingCallback = useCallback(
    (seconds: number, newCallback?: () => void) => {
      setTimeLeft(seconds)
      if (completedCallback) {
        completedCallback()
      }
      setCompletedCallback(() => newCallback)
    },
    [setTimeLeft, setCompletedCallback, completedCallback],
  )

  const clearCountdownTimerAndExecuteCallback = useCallback(() => {
    setTimeLeft(0)
  }, [setTimeLeft])

  return {
    timeLeft,
    startCountdownTimer,
    stopCountdownTimer,
    resetCountdownTimer,
    resetCountdownTimerAndExecuteExistingCallback,
    clearCountdownTimerAndExecuteCallback,
  }
}
