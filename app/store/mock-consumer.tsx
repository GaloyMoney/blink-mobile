import * as React from "react"
import { View, Text } from "react-native"

import { usePersistentStateContext } from "@app/store/persistent-state"

export const MockConsumer: React.FC = () => {
  const { persistentState } = usePersistentStateContext()
  const { galoyAuthToken, schemaVersion, galoyInstance } = persistentState

  return (
    <View>
      <Text>{schemaVersion}</Text>
      <Text>{galoyAuthToken}</Text>
      <Text>{galoyInstance.id}</Text>
    </View>
  )
}
