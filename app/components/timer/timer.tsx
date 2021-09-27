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
  const [isRun, setIsRun] = useState(false)

  const runTimer = useCallback(() => {
    setIsRun(true)
    const startTime = new Date()
    const interval = setInterval(() => {
      let count = computeCount(startTime)
      if (count <= 0) {
        count = 0
        clearInterval(interval)
        onTimerFinish()
        setIsRun(false)
      }
      setTimer(count)
    }, 1000)
    return () => clearInterval(interval)
  }, [onTimerFinish])

  useEffect(() => {
    if (count === 60 && !isRun) {
      runTimer()
    }
  }, [isRun, count, runTimer])

  return <Text>{parseTimer(timer)}</Text>
}
