import React, { useCallback, useEffect, useState } from "react"
import { Text } from "react-native"
import { computeCount, parseTimer } from "./utils"
import { ComponentType } from "@app/types/jsx"

type Props = {
  onTimerFinish: () => void
  count: number
}

export const Timer: ComponentType = ({ onTimerFinish, count }: Props) => {
  const [timer, setTimer] = useState(60)
  const [timerIsActive, setTimerIsActive] = useState(false)

  const runTimer = useCallback(() => {
    setTimerIsActive(true)
    const startTime = new Date()
    setTimer(computeCount(startTime))
    const interval = setInterval(() => {
      let count = computeCount(startTime)
      if (count <= 0) {
        count = 0
        clearInterval(interval)
        onTimerFinish()
        setTimerIsActive(false)
      }
      setTimer(count)
    }, 1000)
    return () => clearInterval(interval)
  }, [onTimerFinish])

  useEffect(() => {
    if (count === 60 && !timerIsActive) {
      runTimer()
    }
  }, [timerIsActive, count, runTimer])

  return <Text>{parseTimer(timer)}</Text>
}
