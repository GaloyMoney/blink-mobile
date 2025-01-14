import { usePersistentStateContext } from "@app/store/persistent-state"
import { SettingsRow } from "./row"
import { Switch } from "@rneui/themed"
import React from "react"

export const ChatSetting: React.FC = () => {
  const { persistentState, updateState } = usePersistentStateContext()
  return (
    <SettingsRow
      title="Enable Chat"
      leftIcon="chatbubbles-outline"
      action={() => {}}
      rightIcon={
        <Switch
          value={!!persistentState.chatEnabled}
          onValueChange={(enabled) => {
            updateState((state: any) => {
              if (state)
                return {
                  ...state,
                  chatEnabled: enabled,
                }
              return undefined
            })
          }}
        />
      }
    />
  )
}
